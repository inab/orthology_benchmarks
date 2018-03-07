#!/usr/bin/env python2

import numpy as np
import scipy as sp
import scipy.stats
from math import sqrt
import pandas
import matplotlib.pyplot as plt
import os
import random
import gzip
import subprocess


# function to unzip a gzip file
def unzipper(filename):
    f = gzip.open(filename, 'rb')
    file_content = f.read()
    f.close()
    os.remove(filename)
    with open(filename[:-3], 'wb') as f_out:
        f_out.write(file_content)


# function that gets mean and confidence intervals
def mean_confidence_interval(data, confidence=0.95):
    a = 1.0 * np.array(data)
    n = len(a)
    m, se = np.mean(a), scipy.stats.sem(a)
    h = se * sp.stats.t._ppf((1 + confidence) / 2., n - 1)
    return (m, h)


# function that reads a tsv file and returns statistic values and tool name
def read_tsv_file(filename):
    # read file as csv
    data = pandas.read_csv(input_dir + filename, sep='\t')
    tool_name = (data.iloc[1, 0])
    RF_distance = data.iloc[:, 3]
    # get number of completed tree samples
    comp_samples = len(RF_distance)
    # get mean and confidence interval
    mean, conf = mean_confidence_interval(RF_distance)
    return (tool_name, comp_samples, mean, conf)


'''
CODE FROM "http://oco-carbon.com/metrics/find-pareto-frontiers-in-python/"
Method to take two equally-sized lists and return just the elements which lie 
on the Pareto frontier, sorted into order.
Default behaviour is to find the maximum for both X and Y, but the option is
available to specify maxX = False or maxY = False to find the minimum for either
or both of the parameters.
'''


def pareto_frontier(Xs, Ys, maxX=True, maxY=True):
    # Sort the list in either ascending or descending order of X
    myList = sorted([[Xs[i], Ys[i]] for i in range(len(Xs))], reverse=maxX)
    # Start the Pareto frontier with the first value in the sorted list
    p_front = [myList[0]]
    # Loop through the sorted list
    for pair in myList[1:]:
        if maxY:
            if pair[1] >= p_front[-1][1]:  # Look for higher values of Y
                p_front.append(pair)  # and add them to the Pareto frontier
        else:
            if pair[1] <= p_front[-1][1]:  # look for lower values of Y
                p_front.append(pair)  # and add them to the pareto frontier
    # Turn resulting pairs back into a list of Xs and Ys
    p_frontX = [pair[0] for pair in p_front]
    p_frontY = [pair[1] for pair in p_front]
    return p_frontX, p_frontY


###########################################################################################################
###########################################################################################################

# SET INPUT DATA DIRECTORY
input_dir = "input/"

# unzip input files
cwd = os.getcwd()
os.chdir(input_dir)
for filename in os.listdir(os.getcwd()):
    if filename.endswith('.gz'):
        unzipper(filename)

os.chdir(cwd)

# create lists for information about the dataset
tools = []
completed_tree_samples = []
means = []
errors = []

# loop over all files in input directory to get information
for filename in os.listdir(input_dir):
    # check if file is empty and delete if so
    if os.stat(input_dir + filename).st_size == 0:
        os.remove(input_dir + filename)
        continue

    # format header
    with open(input_dir + filename) as f:
        newText = f.read().replace(' <TAB> ', '\t')

    with open(input_dir + filename, "w") as f:
        f.write(newText)

    tool_name, comp_samples, mean, conf = read_tsv_file(filename)

    tools.append(tool_name)
    completed_tree_samples.append(comp_samples)
    means.append(mean)
    errors.append(conf)

# plot
ax = plt.subplot()
markers = [".", ",", "o", "v", "^", "<", ">", "1", "2", "3", "4", "8", "s", "p", "P", "*", "h", "H", "+", "x", "X", "D",
           "d", "|", "_"]
for i in range(len(means)):
    new_color = "#%06x" % random.randint(0, 0xFFFFFF)
    marker_style = markers[random.randint(0, len(markers) - 1)]
    ax.errorbar(completed_tree_samples[i], means[i], errors[i], linestyle='None', marker=marker_style,
                 markersize='8', markerfacecolor=new_color, markeredgecolor=new_color, capsize=4,
                 ecolor=new_color, label=tools[i])

# change plot style

plt.ylim(ymin=0.04, ymax=0.1)
plt.xlim(xmin=4000, xmax=14000)
plt.title('Species tree discordance benchmark', fontsize=18, fontweight='bold')

ax.set_xlabel('Completed tree samples (out of 50k trials)', fontsize=12)
ax.set_ylabel('average RF distance', fontsize=12)

# Shrink current axis's height  on the bottom
box = ax.get_position()
ax.set_position([box.x0, box.y0 + box.height * 0.25,
                 box.width, box.height * 0.75])

# Put a legend below current axis
plt.legend(loc='upper center', bbox_to_anchor=(0.5, -0.12), markerscale=0.7,
           fancybox=True, shadow=True, ncol=5, prop={'size': 9})

# get pareto frontier and plot
# p_frontX, p_frontY = pareto_frontier(completed_tree_samples, means, maxY = False)
# append edges to pareto frontier
# p_frontX = [p_frontX[0]] + p_frontX + [4000]
# p_frontY = [0.1] + p_frontY + [p_frontY[-1]]
# plt.plot(p_frontX,p_frontY, linestyle='--', color='grey', linewidth=1)

# add 'better' annotation
plt.annotate('better', xy=(13800, 0.042), xytext=(12600, 0.048),
             arrowprops=dict(facecolor='black', shrink=0.05, width=0.9))

plt.show()
