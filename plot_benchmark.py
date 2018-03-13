#!/usr/bin/env python2

import numpy as np
from math import sqrt
import scipy as sp
import scipy.stats
import pandas
import matplotlib.pyplot as plt
import os
import random
import gzip

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


# funtion to retrieve the used tool name. Depending on the method the dataset format differs
def get_tool_name(filename, data, method):
    if method == "STD":
        return data.iloc[1, 0]
    elif method == "GO_Conservation_test":
        with open(input_dir + filename) as f:
            header = f.readline()
            return (header.split("from ")[1])


# function that reads a tsv file and returns statistic values and tool name
def read_tsv_file(filename, method):
    # read file as csv. Ignore first line(header)
    data = pandas.read_csv(input_dir + filename, sep='\t', comment="#", header=None)
    tool_name = get_tool_name(filename, data, method)
    # depending on the method used, numerical values are in columns 3 or 4
    if method == "STD":
        values = data.iloc[:, 3]
    elif method == "GO_Conservation_test":
        values = data.iloc[:, 2]
    # get number of completed tree samples
    comp_samples = len(values)
    # get mean and confidence interval
    mean, conf = mean_confidence_interval(values)
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


#funtion that gets quartiles for x and y values
def plot_quartiles(x_values, means, better):

    #get distance to lowest score corner
    if better == "bottom-right":
        worse_point = (0,1)
    #normalize data
    minX = 9999
    maxX = -1
    minY = 9999
    maxY = -1
    for value in x_values:
        maxX = float(max(maxX, value))
        minX = min(minX, value)
    for value in means:
        maxY = float(max(maxY, value))
        minY = min(minY, value)
    x_norm = [(x - minX) / (maxX - minX) for x in x_values]
    means_norm = [(y - minY) / (maxY - minY) for y in means]

    scores = []
    for i in range(len(x_norm)):
        scores.append(x_norm[i] * (1 - means_norm[i]))

    # sort the list in descending order
    scores_and_values = sorted([[scores[i], x_values[i], means[i]] for i in range(len(scores))], reverse=True)
    scores = sorted(scores, reverse =True)
    print (scores)
    print (np.percentile(scores, 25), np.percentile(scores, 50), np.percentile(scores, 75))
    first_quartile, second_quartile, third_quartile = (np.nanpercentile(scores, 25), np.nanpercentile(scores, 50), np.nanpercentile(scores, 75))
    for i in range(len(scores_and_values)):
        if scores_and_values[i][0] <= second_quartile:
            target = [(scores_and_values[i-1][1], scores_and_values[i-1][2]),(scores_and_values[i][1], scores_and_values[i][2])]
            print(target)
            break
    plt.plot((target[0][0]+target[1][0])/2, (target[0][1] + target[1][1])/2, '*')
    # x_percentile, y_percentile = (np.nanpercentile(x_values, percentile), np.nanpercentile(means, percentile))
    # plt.axvline(x=x_percentile, linestyle='-', color='black', linewidth=0.1)
    # plt.axhline(y=y_percentile, linestyle='-', color='black', linewidth=0.1)
    # ax.add_patch(patches.Rectangle((x_percentile, y_percentile), ax.get_xlim()[1]-x_percentile, ax.get_ylim()[1]-y_percentile, color="grey", alpha=0.1))
    # ax.add_patch(patches.Rectangle((ax.get_xlim()[0], ax.get_ylim()[0]), x_percentile, y_percentile, color="grey", alpha=0.1))

###########################################################################################################
###########################################################################################################

# SET BENCHMARKING METHOD
# method = "GO_Conservation_test"
method = "STD"
# SET INPUT DATA DIRECTORY
input_dir = "input/" + method + "/"

# unzip input files
cwd = os.getcwd()
os.chdir(input_dir)
for filename in os.listdir(os.getcwd()):
    if filename.endswith('.gz'):
        unzipper(filename)

os.chdir(cwd)

# create lists for information about the dataset
tools = []
x_values = []
means = []
errors = []

# loop over all files in input directory to get information
for filename in os.listdir(input_dir):
    # check if file is empty and delete if so
    if os.stat(input_dir + filename).st_size == 0:
        os.remove(input_dir + filename)
        continue

    tool_name, comp_samples, mean, conf = read_tsv_file(filename, method)

    tools.append(tool_name)
    x_values.append(comp_samples)
    means.append(mean)
    errors.append(conf)

# plot
ax = plt.subplot()
markers = [".", ",", "o", "v", "^", "<", ">", "1", "2", "3", "4", "8", "s", "p", "P", "*", "h", "H", "+", "x", "X", "D",
           "d", "|", "_"]
for i in range(len(means)):
    new_color = "#%06x" % random.randint(0, 0xFFFFFF)
    marker_style = markers[random.randint(0, len(markers) - 1)]
    ax.errorbar(x_values[i], means[i], errors[i], linestyle='None', marker=marker_style,
                markersize='8', markerfacecolor=new_color, markeredgecolor=new_color, capsize=4,
                ecolor=new_color, label=tools[i])

# change plot style
# set plot title depending on the analysed tool
if method == "STD":
    main_title = 'Species Tree Discordance Benchmark'
elif method == "GO_Conservation_test":
    main_title = 'Gene Ontology Conservation Test Benchmark'

plt.title(main_title, fontsize=18, fontweight='bold')

# set plot title depending on the analysed tool
if method == "STD":
    x_label = 'Completed tree samples (out of 50k trials)'
    y_label = 'Average RF distance'
elif method == "GO_Conservation_test":
    x_label = 'Ortholog relations'
    y_label = 'Average Schlicker Similarity'

ax.set_xlabel(x_label, fontsize=12)
ax.set_ylabel(y_label, fontsize=12)

# Shrink current axis's height  on the bottom
box = ax.get_position()
ax.set_position([box.x0, box.y0 + box.height * 0.25,
                 box.width, box.height * 0.75])

# Put a legend below current axis
plt.legend(loc='upper center', bbox_to_anchor=(0.5, -0.12), markerscale=0.7,
           fancybox=True, shadow=True, ncol=5, prop={'size': 9})

# get which corner of the plot corresponds to better performance (depending on tool)
if method == "STD":
    better = 'bottom-right'
    max_x = True
    max_y = False
elif method == "GO_Conservation_test":
    better = 'top-right'
    max_x = True
    max_y = True

# set the axis limits
x_lims = ax.get_xlim()
plt.xlim(x_lims)
y_lims = ax.get_ylim()
plt.ylim(y_lims)
ax.get_xaxis().set_major_formatter(plt.FuncFormatter(lambda x, loc: "{:,}".format(int(x))))

# get pareto frontier and plot
p_frontX, p_frontY = pareto_frontier(x_values, means, maxX=max_x, maxY=max_y)
plt.plot(p_frontX, p_frontY, linestyle='--', color='grey', linewidth=1)
# append edges to pareto frontier
if better == 'bottom-right':
    left_edge = [[x_lims[0], p_frontX[-1]], [p_frontY[-1], p_frontY[-1]]]
    right_edge = [[p_frontX[0], p_frontX[0]], [p_frontY[0], y_lims[1]]]
    plt.plot(left_edge[0], left_edge[1], right_edge[0], right_edge[1], linestyle='--', color='red', linewidth=1)
elif better == 'top-right':
    left_edge = [[x_lims[0], p_frontX[-1]], [p_frontY[-1], p_frontY[-1]]]
    right_edge = [[p_frontX[0], p_frontX[0]], [p_frontY[0], y_lims[0]]]
    plt.plot(left_edge[0], left_edge[1], right_edge[0], right_edge[1], linestyle='--', color='red', linewidth=1)

# add 'better' annotation
if better == 'bottom-right':
    plt.annotate('better', xy=(0.98, 0.04), xycoords='axes fraction',
                 xytext=(-30, 30), textcoords='offset points',
                 ha="right", va="bottom",
                 arrowprops=dict(facecolor='black', shrink=0.05, width=0.9))

elif better == 'top-right':
    plt.annotate('better', xy=(0.98, 0.95), xycoords='axes fraction',
                 xytext=(-30, -30), textcoords='offset points',
                 ha="right", va="top",
                 arrowprops=dict(facecolor='black', shrink=0.05, width=0.9))

#plot quartiles
plot_quartiles(x_values, means, better)


# ROC CURVES



plt.show()
