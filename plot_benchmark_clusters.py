#!/usr/bin/env python2

from __future__ import division
import numpy as np
import scipy as sp
import scipy.stats
from statsmodels.stats.proportion import proportion_confint
import pandas
import matplotlib.pyplot as plt
import os
import random
import gzip
from sklearn.cluster import KMeans
from scipy.spatial import Voronoi


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
    m, se = np.nanmean(a), scipy.stats.sem(a)
    h = se * sp.stats.t._ppf((1 + confidence) / 2., n - 1)
    return (m, h)


# funtion to retrieve the used tool name. Depending on the method the dataset format differs
def get_tool_name(filename, data, method):
    if method == "STD" or method == "Generalized_STD":
        return data.iloc[1, 0]
    elif method == "GO_Conservation_test" or method == "EC_Conservation_test":
        with open(input_dir + filename) as f:
            header = f.readline()
            return (header.split("from ")[1].rstrip())


# function that reads a tsv file and returns statistic values and tool name
def read_tsv_file_numerical(filename, method):
    # read file as csv. Ignore first line(header)
    data = pandas.read_csv(input_dir + filename, sep='\t', comment="#", header=None)
    tool_name = get_tool_name(filename, data, method)
    # depending on the method used, numerical values are in columns 3 or 4
    if method == "STD" or method == "Generalized_STD":
        values = data.iloc[:, 3]
    elif method == "GO_Conservation_test" or method == "EC_Conservation_test":
        values = data.iloc[:, 2]
    # get number of completed tree samples
    comp_samples = len(values)
    # get mean and confidence interval
    mean, conf = mean_confidence_interval(values)
    return (tool_name, comp_samples, mean, conf)


# function that reads a tsv file and returns statistic values and tool name
def read_tsv_file_binomial(filename, method):
    # read file as csv. Ignore first line(header)
    data = pandas.read_csv(input_dir + filename, sep='\t', comment="#", header=None)
    tool_name = filename.split('_')[0]
    if tool_name == "RBH-BBH":
        tool_name = "RBH / BBH"
    elif tool_name == "RSD-0.8-1e-5-Deluca":
        tool_name = "RSD 0.8 1e-5 Deluca"
    elif tool_name == "orthoinspector-1.30-(blast-threshold-10-9)":
        tool_name = "orthoinspector 1.30 (blast threshold 10-9)"
    else:
        tool_name = tool_name.replace("-", " ")
    # print (tool_name)
    # the true /false positite/negative values are in the fourth column
    values = list(data.iloc[:, 3])
    # get get TRUE POSITIVE RATE
    num_TP = values.count('TP')
    num_FN = values.count('FN')
    true_positive_rate = num_TP / (num_TP + num_FN)
    # get predictive positive value rate
    num_positives = values.count('TP') + values.count('FP')
    predictive_pos_value_rate = num_TP / num_positives

    # confidence interval
    CI = proportion_confint(num_TP, num_TP + num_FN)
    true_positive_CI = true_positive_rate - CI[0]
    CI = proportion_confint(num_TP, num_positives)
    predictive_pos_value_CI = predictive_pos_value_rate - CI[0]

    return (tool_name, true_positive_rate, true_positive_CI, predictive_pos_value_rate, predictive_pos_value_CI)


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
    myList = sorted([[Xs[i], Ys[i]] for i, val in enumerate(Xs, 0)], reverse=maxX)
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


# funtion that gets quartiles for x and y values
def plot_square_quartiles(x_values, means, tools, better, percentile=50):
    x_percentile, y_percentile = (np.nanpercentile(x_values, percentile), np.nanpercentile(means, percentile))
    # plt.axvline(x=x_percentile, linestyle='-', color='black', linewidth=0.1)
    # plt.axhline(y=y_percentile, linestyle='-', color='black', linewidth=0.1)

    # create a dictionary with tools and their corresponding quartile
    tools_quartiles = {}
    if better == "bottom-right":
        for i, val in enumerate(tools, 0):
            if x_values[i] >= x_percentile and means[i] <= y_percentile:
                tools_quartiles[tools[i]] = 1
            elif x_values[i] >= x_percentile and means[i] > y_percentile:
                tools_quartiles[tools[i]] = 3
            elif x_values[i] < x_percentile and means[i] > y_percentile:
                tools_quartiles[tools[i]] = 4
            elif x_values[i] < x_percentile and means[i] <= y_percentile:
                tools_quartiles[tools[i]] = 2
    elif better == "top-right":
        for i, val in enumerate(tools, 0):
            if x_values[i] >= x_percentile and means[i] < y_percentile:
                tools_quartiles[tools[i]] = 3
            elif x_values[i] >= x_percentile and means[i] >= y_percentile:
                tools_quartiles[tools[i]] = 1
            elif x_values[i] < x_percentile and means[i] >= y_percentile:
                tools_quartiles[tools[i]] = 2
            elif x_values[i] < x_percentile and means[i] < y_percentile:
                tools_quartiles[tools[i]] = 4
    return (tools_quartiles)


# function to normalize the x and y axis to 0-1 range
def normalize_data(x_values, means):
    maxX = max(x_values)
    minX = min(x_values)
    maxY = max(means)
    minY = min(means)
    # maxX = ax.get_xlim()[1]
    # minX = ax.get_xlim()[0]
    # maxY = ax.get_ylim()[1]
    # minY = ax.get_ylim()[0]
    # x_norm = [(x - minX) / (maxX - minX) for x in x_values]
    # means_norm = [(y - minY) / (maxY - minY) for y in means]
    x_norm = [x / maxX for x in x_values]
    means_norm = [y / maxY for y in means]
    return x_norm, means_norm


# funtion that plots a diagonal line separating the values by the given quartile
def draw_diagonal_line(scores_and_values, quartile, better, max_x, max_y):
    for i, val in enumerate(scores_and_values, 0):
        # find out which are the two points that contain the percentile value
        if scores_and_values[i][0] <= quartile:
            target = [(scores_and_values[i - 1][1], scores_and_values[i - 1][2]),
                      (scores_and_values[i][1], scores_and_values[i][2])]
            break
    # get the the mid point between the two, where the quartile line will pass
    half_point = (target[0][0] + target[1][0]) / 2, (target[0][1] + target[1][1]) / 2
    # plt.plot(half_point[0], half_point[1], '*')
    # draw the line depending on which is the optimal corner
    if better == "bottom-right":
        x_coords = (half_point[0] - max_x, half_point[0] + max_x)
        y_coords = (half_point[1] - max_y, half_point[1] + max_y)
    elif better == "top-right":
        x_coords = (half_point[0] + max_x, half_point[0] - max_x)
        y_coords = (half_point[1] - max_y, half_point[1] + max_y)

    plt.plot(x_coords, y_coords, linestyle='--', linewidth=0.5)


# funtion that splits the analysed tools into four quartiles, according to the asigned score
def get_quartile_points(scores_and_values, first_quartile, second_quartile, third_quartile):
    tools_quartiles = {}
    for i, val in enumerate(scores_and_values, 0):
        if scores_and_values[i][0] > third_quartile:
            tools_quartiles[scores_and_values[i][3]] = 1
        elif second_quartile < scores_and_values[i][0] <= third_quartile:
            tools_quartiles[scores_and_values[i][3]] = 2
        elif first_quartile < scores_and_values[i][0] <= second_quartile:
            tools_quartiles[scores_and_values[i][3]] = 3
        elif scores_and_values[i][0] <= first_quartile:
            tools_quartiles[scores_and_values[i][3]] = 4
    return (tools_quartiles)


# funtion that separate the points through diagonal quartiles based on the distance to the 'best corner'
def plot_diagonal_quartiles(x_values, means, tools, better):
    # get distance to lowest score corner

    # normalize data to 0-1 range
    x_norm, means_norm = normalize_data(x_values, means)
    max_x = max(x_values)
    max_y = max(means)
    # compute the scores for each of the tool. based on their distance to the x and y axis
    scores = []
    for i, val in enumerate(x_norm, 0):
        if better == "bottom-right":
            scores.append(x_norm[i] + (1 - means_norm[i]))
        elif better == "top-right":
            scores.append(x_norm[i] + means_norm[i])

    # add plot annotation boxes with info about scores and tool names
    for counter, scr in enumerate(scores):
        plt.annotate(
            tools[counter] + "\n",
            # str(round(x_norm[counter], 6)) + " * " + str(round(1 - means_norm[counter], 6)) + " = " + str(round(scr, 8)),
            # "score = " + str(round(scr, 3)),
            xy=(x_values[counter], means[counter]), xytext=(0, 20),
            textcoords='offset points', ha='right', va='bottom',
            bbox=dict(boxstyle='round,pad=0.5', fc='yellow', alpha=0.15),
            size=7,
            arrowprops=dict(arrowstyle='->', connectionstyle='arc3,rad=0'))

    # region sort the list in descending order
    scores_and_values = sorted([[scores[i], x_values[i], means[i], tools[i]] for i, val in enumerate(scores, 0)],
                               reverse=True)
    scores = sorted(scores, reverse=True)
    # print (scores_and_values)
    # print (scores)
    # endregion
    first_quartile, second_quartile, third_quartile = (
        np.nanpercentile(scores, 25), np.nanpercentile(scores, 50), np.nanpercentile(scores, 75))
    # print (first_quartile, second_quartile, third_quartile)
    # draw_diagonal_line(scores_and_values, first_quartile, better, max_x, max_y)
    # draw_diagonal_line(scores_and_values, second_quartile, better, max_x, max_y)
    # draw_diagonal_line(scores_and_values, third_quartile, better, max_x, max_y)

    # split in quartiles
    tools_quartiles = get_quartile_points(scores_and_values, first_quartile, second_quartile, third_quartile)
    return (tools_quartiles)


# functions that adds a new marker to each f the points in the plot that corresponds to a quartile
def add_quartile_numbers_to_plot(x_values, means, tools, tools_quartiles):
    for x, y, name in zip(x_values, means, tools):
        for key in tools_quartiles:
            if key == name:
                plt.text(x, y, tools_quartiles[key], color="red", fontsize=12)


# function that prints a table with the list of tools and the corresponding quartiles
def print_quartiles_table(tools_quartiles_squares, tools_quartiles_diagonal, tools_clusters, method):
    row_names = tools_quartiles_squares.keys()
    quartiles_1 = tools_quartiles_squares.values()
    quartiles_2 = []
    clusters = []
    for i, val in enumerate(row_names, 0):
        quartiles_2.append(tools_quartiles_diagonal[row_names[i]])
        clusters.append(tools_clusters[row_names[i]])
    colnames = ["TOOL", "Cluster"] #, "Quartile_diag", "Cluster"]
    celltxt = zip(row_names, clusters) #, quartiles_2, clusters)
    df = pandas.DataFrame(celltxt)
    vals = df.values

    # set cell colors depending on the quartile
    colors = df.applymap(lambda x: '#66cdaa' if x == 1 else '#7fffd4' if x == 2 else '#ffa07a' if x == 3
    else '#fa8072' if x == 4 else '#ffffff')
    # grey color scale
    colors = df.applymap(lambda x: '#919191' if x == 1 else '#B0B0B0' if x == 2 else '#CFCFCF' if x == 3
    else '#EDEDED' if x == 4 else '#ffffff')
    # green color scale
    colors = df.applymap(lambda x: '#238b45' if x == 1 else '#ffffff')
    # red color scale
    # colors = df.applymap(lambda x: '#fee5d9' if x == 1 else '#fcae91' if x == 2 else '#fb6a4a' if x == 3
    # else '#cb181d' if x == 4 else '#ffffff')

    colors = colors.values

    the_table = plt.table(cellText=vals,
                          colLabels=colnames,
                          cellLoc='center',
                          loc='right',
                          bbox=[1.1, 0.15, 0.5, 0.8],
                          colWidths=[1.2, 0.5],
                          cellColours=colors,
                          colColours=['#ffffff'] * 2)
    the_table.auto_set_font_size(False)
    the_table.set_fontsize(8)
    plt.subplots_adjust(right=0.65, bottom=0.2)


# function that prints a table with the list of tools and the corresponding quartiles
def print_full_table(quartiles_table):
    # (tools_quartiles_squares, tools_quartiles_diagonal, method):
    colnames = ["TOOL / QUARTILES -->"]
    for name in quartiles_table.keys():
        colnames.append("SQR")
        colnames.append("DIAG")
        colnames.append("CLUST  ")
    colnames.extend(["# SQR", "# DIAG", "# CLUST"])
    row_names = quartiles_table[next(iter(quartiles_table))][0].keys()
    quartiles_list = []

    for name in sorted(quartiles_table.iterkeys()):
        quartiles_sqr = []
        quartiles_diag = []
        clusters = []
        for i in row_names:
            # print (name)
            # print (i, quartiles_table[name][0][i])
            # quartiles_sqr.append(quartiles_table[name][0][i])
            # quartiles_diag.append(quartiles_table[name][1][i])
            clusters.append(quartiles_table[name][2][i])
        # quartiles_list.append(quartiles_sqr)
        # quartiles_list.append(quartiles_diag)
        quartiles_list.append(clusters)
    print (quartiles_list)
    text = []
    for tool in row_names:
        text.append([tool])

    for num, name in enumerate(row_names):
        for i in range(len(quartiles_table.keys())):# * 3):
            text[num].append(quartiles_list[i][num])
    print (text)

    # get total score for square and diagonal quartiles
    sqr_quartiles_sums = {}
    diag_quartiles_sums = {}
    cluster_sums = {}
    for num, val in enumerate(text):
        # total_sqr = sum(text[num][i] for i in range(1, len(text[num]), 1))
        # total_diag = sum(text[num][i] for i in range(2, len(text[num]), 1))
        total_clust = sum(text[num][i] for i in range(1, len(text[num]), 1))
        # sqr_quartiles_sums[text[num][0]] = total_sqr
        # diag_quartiles_sums[text[num][0]] = total_diag
        cluster_sums[text[num][0]] = total_clust
    # sort tools by that score to rank them
    # sorted_sqr_quartiles_sums = sorted(sqr_quartiles_sums.items(), key=lambda x: x[1])
    # sorted_diag_quartiles_sums = sorted(diag_quartiles_sums.items(), key=lambda x: x[1])
    sorted_clust_sums = sorted(cluster_sums.items(), key=lambda x: x[1])

    # append to the final table
    # for i, val in enumerate(sorted_sqr_quartiles_sums):
    #     for j, lst in enumerate(text):
    #         if val[0] == text[j][0]:
    #             text[j].append("# " + str(i + 1))
    # for i, val in enumerate(sorted_diag_quartiles_sums):
    #     for j, lst in enumerate(text):
    #         if val[0] == text[j][0]:
    #             text[j].append("# " + str(i + 1))
    for i, val in enumerate(sorted_clust_sums):
        for j, lst in enumerate(text):
            if val[0] == text[j][0]:
                text[j].append("# " + str(i + 1))

    print (text)

    df = pandas.DataFrame(text)
    vals = df.values

    ##
    colors = df.applymap(lambda x: '#66cdaa' if x == 1 else '#7fffd4' if x == 2 else '#ffa07a' if x == 3
    else '#fa8072' if x == 4 else '#ffffff')
    # grey color scale
    colors = df.applymap(lambda x: '#919191' if x == 1 else '#B0B0B0' if x == 2 else '#CFCFCF' if x == 3
    else '#EDEDED' if x == 4 else '#ffffff')
    # green color scale
    colors = df.applymap(lambda x: '#238b45' if x == 1 else '#ffffff')
    # # red color scale
    # colors = df.applymap(lambda x: '#fee5d9' if x == 1 else '#fcae91' if x == 2 else '#fb6a4a' if x == 3
    # else '#cb181d' if x == 4 else '#ffffff')

    colors = colors.values

    ##
    fig, ax = plt.subplots()
    # hide axes
    fig.patch.set_visible(False)
    ax.axis('off')
    ax.axis('tight')

    fig.tight_layout()
    method_names = sorted(quartiles_table.iterkeys())
    for i, val in enumerate(method_names):
        method_names[i] = method_names[i].replace("_", "\n")
    method_names = ["TOOL / BENCHMARKING METHOD -->"] + method_names
    method_names.append("# RANKING #")
    header_text = ["K-MEANS CLUSTERING CLASSIFICATION RESULTS"]
    header = plt.table(cellText=[[''] * 1],
                       colLabels=header_text,
                       loc='top',
                       bbox=[0.09, 0.92, 0.82, 0.11],
                       colWidths=[0.5],

                       colColours=['#ffffff'] * 1
                       )
    header.auto_set_font_size(False)
    header.set_fontsize(12)
    the_table = ax.table(cellText=vals,
                         colLabels=method_names,
                         cellLoc='center',
                         loc='center',
                         # bbox=[1.1, 0.15, 0.5, 0.8])
                         colWidths=[0.16, 0.06, 0.06, 0.06, 0.06, 0.06, 0.06, 0.06, 0.06, 0.06, 0.06, 0.06],
                         cellColours=colors,
                         colColours=['#ffffff'] * len(df.columns))
    fig.tight_layout()
    the_table.auto_set_font_size(False)
    the_table.set_fontsize(9)
    the_table.scale(1, 1.5)
    plt.subplots_adjust(right=0.95, left=0.04, top=0.9, bottom=0.1)
     


####
def voronoi_finite_polygons_2d(vor, radius=None):
    """
    Reconstruct infinite voronoi regions in a 2D diagram to finite
    regions.

    Parameters
    ----------
    vor : Voronoi
        Input diagram
    radius : float, optional
        Distance to 'points at infinity'.

    Returns
    -------
    regions : list of tuples
        Indices of vertices in each revised Voronoi regions.
    vertices : list of tuples
        Coordinates for revised Voronoi vertices. Same as coordinates
        of input vertices, with 'points at infinity' appended to the
        end.

    """

    if vor.points.shape[1] != 2:
        raise ValueError("Requires 2D input")

    new_regions = []
    new_vertices = vor.vertices.tolist()

    center = vor.points.mean(axis=0)
    if radius is None:
        radius = vor.points.ptp().max() * 2

    # Construct a map containing all ridges for a given point
    all_ridges = {}
    for (p1, p2), (v1, v2) in zip(vor.ridge_points, vor.ridge_vertices):
        all_ridges.setdefault(p1, []).append((p2, v1, v2))
        all_ridges.setdefault(p2, []).append((p1, v1, v2))

    # Reconstruct infinite regions
    for p1, region in enumerate(vor.point_region):
        vertices = vor.regions[region]

        if all([v >= 0 for v in vertices]):
            # finite region
            new_regions.append(vertices)
            continue

        # reconstruct a non-finite region
        ridges = all_ridges[p1]
        new_region = [v for v in vertices if v >= 0]

        for p2, v1, v2 in ridges:
            if v2 < 0:
                v1, v2 = v2, v1
            if v1 >= 0:
                # finite ridge: already in the region
                continue

            # Compute the missing endpoint of an infinite ridge

            t = vor.points[p2] - vor.points[p1]  # tangent
            t /= np.linalg.norm(t)
            n = np.array([-t[1], t[0]])  # normal

            midpoint = vor.points[[p1, p2]].mean(axis=0)
            direction = np.sign(np.dot(midpoint - center, n)) * n
            far_point = vor.vertices[v2] + direction * radius

            new_region.append(len(new_vertices))
            new_vertices.append(far_point.tolist())

        # sort region counterclockwise
        vs = np.asarray([new_vertices[v] for v in new_region])
        c = vs.mean(axis=0)
        angles = np.arctan2(vs[:, 1] - c[1], vs[:, 0] - c[0])
        new_region = np.array(new_region)[np.argsort(angles)]

        # finish
        new_regions.append(new_region.tolist())

    return new_regions, np.asarray(new_vertices)


#####
def cluster_tools(my_array, tools, method, organism, better):
    X = np.array(my_array)
    kmeans = KMeans(n_clusters=4, n_init=50, random_state=0).fit(X)
    # print (method, organism)
    cluster_no = kmeans.labels_

    centroids = kmeans.cluster_centers_

    # normalize data to 0-1 range
    x_values = []
    y_values = []
    for centroid in centroids:
        x_values.append(centroid[0])
        y_values.append(centroid[1])
    x_norm, y_norm = normalize_data(x_values, y_values)
    # plt.plot(centroids[0][0], centroids[0][1], '*')
    # get distance from centroids to better corner
    distances = []
    if better == "top-right":
        best_point = [1, 1]
        for x, y in zip(x_norm, y_norm):
            distances.append(x + y)
    elif better == "bottom-right":
        best_point = [1, 0]
        for x, y in zip(x_norm, y_norm):
            distances.append(x + (1 - y))
    # for i, centroid in enumerate(centroids):
    #     plt.plot(centroid[0], centroid[1], '*', markersize=20)
        # plt.text(centroid[0], centroid[1], distances[i], color="green", fontsize=18)

    # assing ranking to distances array
    output = [0] * len(distances)
    for i, x in enumerate(sorted(range(len(distances)), key=lambda y: distances[y], reverse=True)):
        output[x] = i

    # reorder the clusters according to distance
    for i, val in enumerate(cluster_no):
        for y, num in enumerate(output):
            if val == y:
                cluster_no[i] = num

    tools_clusters = {}
    for (x, y), num, name in zip(X, cluster_no, tools):
        tools_clusters[name] = num + 1
        my_text = plt.text(x, y, num + 1, color="red", fontsize=28)
        my_text.set_alpha(.5)

    # # compute Voronoi tesselation
    # vor = Voronoi(centroids)
    # # plot
    # regions, vertices = voronoi_finite_polygons_2d(vor)
    # # print "--"
    # # print regions
    # # print "--"
    # # print vertices
    #
    # # colorize
    # for region in regions:
    #     polygon = vertices[region]
    #     plt.fill(*zip(*polygon), alpha=0.4)

    #################################################################################################################
    # # Step size of the mesh. Decrease to increase the quality of the VQ.
    # h = .02  # point in the mesh [x_min, x_max]x[y_min, y_max].
    #
    # # Plot the decision boundary. For that, we will assign a color to each
    # x_values=[]
    # y_values=[]
    # for vals in X:
    #     x_values.append(vals[0])
    #     y_values.append(vals[1])
    # x_min, x_max = min(x_values) - 1, max(x_values) + 1
    # y_min, y_max = min(y_values) - 1, max(y_values) + 1
    # xx, yy = np.meshgrid(np.arange(x_min, x_max, h), np.arange(y_min, y_max, h))
    #
    # C = 1.0  # SVM regularization parameter
    # model = (svm.SVC(kernel='poly', degree=4, C=C))
    # clf = model.fit(X, cluster_no)
    # # Plot the decision boundary. For that, we will assign a color to each
    # # point in the mesh [x_min, m_max]x[y_min, y_max].
    # Z = clf.predict(np.c_[xx.ravel(), yy.ravel()])
    #
    # # Put the result into a color plot
    # Z = Z.reshape(xx.shape)
    # plt.contour(xx, yy, Z, cmap=plt.cm.Paired)

    ##################################################################################################################
    return tools_clusters


###########################################################################################################
###########################################################################################################

if __name__ == "__main__":

    # SET BENCHMARKING METHODS

    # methods = ["GO_Conservation_test", "STD", "TreeFam-A", "Generalized_STD", "SwissTree", "EC_Conservation_test"]
    methods = ["STD", "Generalized_STD", "SwissTree", "TreeFam-A", "GO_Conservation_test", "EC_Conservation_test"]
    # methods = ["GO_Conservation_test", "STD", "Generalized_STD", "EC_Conservation_test", "SwissTree"]
    # this dictionary will store all the information required for the quartiles table
    quartiles_table = {}

    for method in methods:

        if method == "STD":
            organisms = ["Eukaryota", "Fungi"]
        elif method == "Generalized_STD":
            organisms = ["Eukaryota", "Fungi", "LUCA", "Vertebrata"]
        else:
            organisms = ["NULL"]
        #  SET INPUT DATA DIRECTORY

        for organism in organisms:
            if organism == "NULL":
                input_dir = "input/" + method + "/"
            else:
                input_dir = "input/" + method + "/" + organism + "/"

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
            errors_x = []

            # loop over all files in input directory to get information
            for filename in os.listdir(input_dir):
                # check if file is empty and delete if so
                if os.stat(input_dir + filename).st_size == 0 or filename == ".DS_Store":
                    os.remove(input_dir + filename)
                    continue
                if method == "TreeFam-A" or method == "SwissTree":
                    tool_name, true_positive_rate, true_positive_CI, predictive_pos_value_rate, predictive_pos_value_CI = read_tsv_file_binomial(
                        filename, method)
                    tools.append(tool_name)
                    x_values.append(true_positive_rate)
                    means.append(predictive_pos_value_rate)
                    errors_x.append(true_positive_CI)
                    errors.append(predictive_pos_value_CI)
                else:
                    tool_name, x_val, mean, conf = read_tsv_file_numerical(filename, method)
                    tools.append(tool_name)
                    x_values.append(x_val)
                    means.append(mean)
                    errors.append(conf)
            # add values manually for Generalized std
            if method == "Generalized_STD":
                if organism == "LUCA":
                    tools = ['EggNOG', 'Ensembl Compara (e81)', 'Hieranoid 2', 'InParanoid', 'InParanoidCore',
                             'OMA GETHOGs', 'OMA Groups (RefSet5)', 'PANTHER 8.0 (LDO only)', 'PANTHER 8.0 (all)',
                             'RBH / BBH', 'RSD 0.8 1e-5 Deluca', 'metaPhOrs',
                             'orthoinspector 1.30 (blast threshold 10-9)',
                             'phylomeDB', 'OMA Pairs (Refset5)']

                    x_values = [2217, 3806, 3862, 4661, 2530, 4639, 1393, 3358, 4877, 4315, 3786, 2848, 3974, 3047,
                                3163]
                    means = [0.191174, 0.240765, 0.211089, 0.199813, 0.176264, 0.190783, 0.167145, 0.21788, 0.269907,
                             0.20917, 0.200261, 0.230796, 0.211106, 0.205282, 0.2106]
                    errors = [0.016054, 0.01485, 0.014252, 0.013808, 0.014481, 0.013562, 0.019364, 0.014325, 0.0153,
                              0.014042, 0.013875, 0.014961, 0.014032, 0.014097, 0.014398]
                elif organism == "Eukaryota":
                    tools = ['EggNOG', 'Ensembl Compara (e81)', 'Hieranoid 2', 'InParanoid', 'InParanoidCore',
                             'OMA GETHOGs', 'OMA Groups (RefSet5)', 'PANTHER 8.0 (LDO only)', 'PANTHER 8.0 (all)',
                             'RBH / BBH', 'RSD 0.8 1e-5 Deluca', 'metaPhOrs',
                             'orthoinspector 1.30 (blast threshold 10-9)',
                             'phylomeDB', 'OMA Pairs (Refset5)']
                    x_values = [4182, 4110, 4122, 4763, 2965, 3534, 756, 4769, 6724, 5265, 4446, 3541, 4931, 3370, 2274]
                    means = [0.254531, 0.275736, 0.237259, 0.240042, 0.231371, 0.246465, 0.175591, 0.251081, 0.299014,
                             0.247405, 0.250449, 0.26941, 0.254794, 0.247908, 0.214862]
                    errors = [0.010081, 0.010504, 0.009751, 0.009914, 0.009912, 0.009472, 0.017395, 0.01007, 0.011052,
                              0.009892, 0.009962, 0.010357, 0.00987, 0.009961, 0.010764]
                elif organism == "Vertebrata":
                    tools = ['EggNOG', 'Ensembl Compara (e81)', 'Hieranoid 2', 'InParanoid', 'InParanoidCore',
                             'OMA GETHOGs', 'OMA Groups (RefSet5)', 'PANTHER 8.0 (LDO only)', 'PANTHER 8.0 (all)',
                             'RBH / BBH', 'RSD 0.8 1e-5 Deluca', 'metaPhOrs',
                             'orthoinspector 1.30 (blast threshold 10-9)',
                             'phylomeDB', 'OMA Pairs (Refset5)']
                    x_values = [14397, 13466, 11868, 12242, 8956, 11549, 6145, 9740, 13464, 13972, 13730, 17402, 15242,
                                12618, 10239]
                    means = [0.197683, 0.209117, 0.189865, 0.200017, 0.164927, 0.205736, 0.180332, 0.182049, 0.217692,
                             0.198473, 0.19904, 0.208106, 0.196562, 0.192503, 0.20154]
                    errors = [0.006915, 0.00725, 0.006866, 0.007062, 0.006206, 0.007122, 0.006916, 0.006774, 0.00749,
                              0.007109, 0.006979, 0.007244, 0.006882, 0.006679, 0.007445]
                elif organism == "Fungi":
                    tools = ['EggNOG', 'Ensembl Compara (e81)', 'Hieranoid 2', 'InParanoid', 'InParanoidCore',
                             'OMA GETHOGs', 'OMA Groups (RefSet5)', 'PANTHER 8.0 (LDO only)', 'PANTHER 8.0 (all)',
                             'RBH / BBH', 'RSD 0.8 1e-5 Deluca', 'metaPhOrs',
                             'orthoinspector 1.30 (blast threshold 10-9)',
                             'phylomeDB', 'OMA Pairs (Refset5)']
                    x_values = [14782, 15122, 15201, 16481, 13533, 11130, 3584, 15670, 18627, 18304, 16608, 15581,
                                16825,
                                16299, 8778]
                    means = [0.078667, 0.093667, 0.079333, 0.076667, 0.060667, 0.064, 0.040333, 0.075333, 0.107667,
                             0.094667, 0.073667, 0.081, 0.082667, 0.070667, 0.063667]
                    errors = [0.009635, 0.010428, 0.009673, 0.009522, 0.008544, 0.00876, 0.007041, 0.009446, 0.011093,
                              0.010478, 0.009349, 0.009765, 0.009856, 0.009172, 0.008738]

            # plot
            ax = plt.subplot()
            markers = [".", ",", "o", "v", "^", "<", ">", "1", "2", "3", "4", "8", "s", "p", "P", "*", "h", "H", "+",
                       "x", "X",
                       "D",
                       "d", "|", "_"]
            colors = ['#5b2a49', '#a91310', '#9693b0', '#e7afd7', '#fb7f6a', '#0566e5', '#00bdc8', '#cf4119', '#8b123f',
                      '#b35ccc', '#dbf6a6', '#c0b596', '#516e85', '#1343c3', '#7b88be']
            for i, val in enumerate(means, 0):
                # new_color = "#%06x" % random.randint(0, 0xFFFFFF)
                # marker_style = markers[random.randint(0, len(markers) - 1)]
                if not errors_x:
                    ax.errorbar(x_values[i], means[i], errors[i], linestyle='None', marker=markers[i],
                                markersize='8', markerfacecolor=colors[i], markeredgecolor=colors[i], capsize=4,
                                ecolor=colors[i], label=tools[i])

                else:
                    ax.errorbar(x_values[i], means[i], errors_x[i], errors[i], linestyle='None', marker=markers[i],
                                markersize='8', markerfacecolor=colors[i], markeredgecolor=colors[i], capsize=4,
                                ecolor=colors[i], label=tools[i])

            # change plot style
            # set plot title depending on the analysed tool
            if method == "STD":
                main_title = 'Species Tree Discordance Benchmark' + ' - ' + organism
            elif method == "GO_Conservation_test":
                main_title = 'Gene Ontology Conservation Test Benchmark'
            elif method == "TreeFam-A" or method == "SwissTree":
                main_title = "Agreement with Reference Gene Phylogenies: " + method
            elif method == "Generalized_STD":
                main_title = 'Generalized Species Tree Discordance Benchmark' + ' - ' + organism
            elif method == "EC_Conservation_test":
                main_title = "Enzyme Classification Conservation Test Benchmark"

            plt.title(main_title, fontsize=18, fontweight='bold')

            # set plot title depending on the analysed tool
            if method == "STD" or method == "Generalized_STD":
                x_label = 'Completed tree samples (out of 50k trials)'
                y_label = 'Average RF distance'
            elif method == "GO_Conservation_test" or method == "EC_Conservation_test":
                x_label = 'Ortholog relations'
                y_label = 'Average Schlicker Similarity'
            elif method == "TreeFam-A" or method == "SwissTree":
                x_label = ' recall - true positive rate'
                y_label = 'precision - pos. predictive value rate'

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
            if method == "STD" or method == "Generalized_STD":
                better = 'bottom-right'
                max_x = True
                max_y = False
            elif method == "GO_Conservation_test" or method == "TreeFam-A" or method == "SwissTree" or method == "EC_Conservation_test":
                better = 'top-right'
                max_x = True
                max_y = True

            # set the axis limits
            x_lims = ax.get_xlim()
            plt.xlim(x_lims)
            y_lims = ax.get_ylim()
            plt.ylim(y_lims)
            if x_lims[0] >= 1000:
                ax.get_xaxis().set_major_formatter(plt.FuncFormatter(lambda x, loc: "{:,}".format(int(x))))
            if y_lims[0] >= 1000:
                ax.get_yaxis().set_major_formatter(plt.FuncFormatter(lambda y, loc: "{:,}".format(int(y))))

            # get pareto frontier and plot
            p_frontX, p_frontY = pareto_frontier(x_values, means, maxX=max_x, maxY=max_y)
            plt.plot(p_frontX, p_frontY, linestyle='--', color='grey', linewidth=1)
            # append edges to pareto frontier
            if better == 'bottom-right':
                left_edge = [[x_lims[0], p_frontX[-1]], [p_frontY[-1], p_frontY[-1]]]
                right_edge = [[p_frontX[0], p_frontX[0]], [p_frontY[0], y_lims[1]]]
                plt.plot(left_edge[0], left_edge[1], right_edge[0], right_edge[1], linestyle='--', color='red',
                         linewidth=1)
            elif better == 'top-right':
                left_edge = [[x_lims[0], p_frontX[-1]], [p_frontY[-1], p_frontY[-1]]]
                right_edge = [[p_frontX[0], p_frontX[0]], [p_frontY[0], y_lims[0]]]
                plt.plot(left_edge[0], left_edge[1], right_edge[0], right_edge[1], linestyle='--', color='red',
                         linewidth=1)

            # add 'better' annotation and quartile numbers to plot
            if better == 'bottom-right':
                plt.annotate('better', xy=(0.98, 0.04), xycoords='axes fraction',
                             xytext=(-30, 30), textcoords='offset points',
                             ha="right", va="bottom",
                             arrowprops=dict(facecolor='black', shrink=0.05, width=0.9))
                # my_text1 = plt.text(0.99, 0.15, '1',
                #                     verticalalignment='bottom', horizontalalignment='right',
                #                     transform=ax.transAxes, fontsize=25)
                # my_text2 = plt.text(0.01, 0.15, '2',
                #                     verticalalignment='bottom', horizontalalignment='left',
                #                     transform=ax.transAxes, fontsize=25)
                # my_text3 = plt.text(0.99, 0.85, '3',
                #                     verticalalignment='top', horizontalalignment='right',
                #                     transform=ax.transAxes, fontsize=25)
                # my_text4 = plt.text(0.01, 0.85, '4',
                #                     verticalalignment='top', horizontalalignment='left',
                #                     transform=ax.transAxes, fontsize=25)
                # my_text1.set_alpha(.2)
                # my_text2.set_alpha(.2)
                # my_text3.set_alpha(.2)
                # my_text4.set_alpha(.2)
            elif better == 'top-right':
                plt.annotate('better', xy=(0.98, 0.95), xycoords='axes fraction',
                             xytext=(-30, -30), textcoords='offset points',
                             ha="right", va="top",
                             arrowprops=dict(facecolor='black', shrink=0.05, width=0.9))
                # my_text1 = plt.text(0.99, 0.85, '1',
                #                     verticalalignment='top', horizontalalignment='right',
                #                     transform=ax.transAxes, fontsize=25)
                # my_text2 = plt.text(0.01, 0.85, '2',
                #                     verticalalignment='top', horizontalalignment='left',
                #                     transform=ax.transAxes, fontsize=25)
                # my_text3 = plt.text(0.99, 0.15, '3',
                #                     verticalalignment='bottom', horizontalalignment='right',
                #                     transform=ax.transAxes, fontsize=25)
                # my_text4 = plt.text(0.01, 0.15, '4',
                #                     verticalalignment='bottom', horizontalalignment='left',
                #                     transform=ax.transAxes, fontsize=25)

                # my_text1.set_alpha(.2)
                # my_text2.set_alpha(.2)
                # my_text3.set_alpha(.2)
                # my_text4.set_alpha(.2)
            # plot quartiles
            tools_quartiles_squares = plot_square_quartiles(x_values, means, tools, better)
            tools_quartiles_diagonal = plot_diagonal_quartiles(x_values, means, tools, better)
            # add_quartile_numbers_to_plot(x_values, means, tools, tools_quartiles_squares)

            tools_clusters = cluster_tools(zip(x_values, means), tools, method, organism, better)

            print_quartiles_table(tools_quartiles_squares, tools_quartiles_diagonal, tools_clusters, method)

            # add values to the quartiles table dictionary
            if organism == "NULL":
                key = method
            else:
                key = method + "_" + organism

            quartiles_table[key] = [tools_quartiles_squares, tools_quartiles_diagonal, tools_clusters]

            # ROC CURVES

            # plt.show()
            outname = method + "_" + organism + ".png"
            fig = plt.gcf()
            fig.set_size_inches(18.5, 10.5)
            fig.savefig(outname, dpi=100)

            plt.close("all")

    print_full_table(quartiles_table)
    # plt.show()
    out_table = "table.png"
    fig = plt.gcf()
    fig.set_size_inches(20, 11.1)
    fig.savefig(out_table, dpi=100)

    plt.close("all")
