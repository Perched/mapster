var _ = require('lodash');
import AggResponseTabifyTabifyProvider from 'ui/agg_response/tabify/tabify';
import VislibComponentsColorColorPaletteProvider from 'ui/vislib/components/color/color_palette';

var module = require('ui/modules').get('mapster');

module.controller('MapsterController', function ($scope, Private) {
  const tabifyAggResponse = Private(AggResponseTabifyTabifyProvider);
  const createColorPalette = Private(VislibComponentsColorColorPaletteProvider);

  $scope.$watch('esResponse', function (resp) {
    if (resp) {
      const vis = $scope.vis;
      const params = vis.params;

      var table = tabifyAggResponse(vis, resp, {
        partialRows: params.showPatialRows,
        minimalColumns: vis.isHierarchical() && !params.showMeticsAtAllLevels,
        asAggConfigResults: true
      });

      var table = table.tables[0];

      if (table == undefined) {
        $scope.data = null;
        return;
      }

      var colors = {};

      $scope.data = table.rows.map(function(row) {
        var sensor = row[3].key;
        // Fill the colors array
        if (colors[sensor] == undefined) {
          colors[sensor] = 0;
        } else {
          colors[sensor] += 1;
        }

        // Return data rows
        return {
          timestamp: row[0].key,
          coords: row[1].key,
          peer_ip: row[2].key,
          sensor: sensor, 
          count: row[4].key
        };
      });

      // We sort it so the most used sensors have always the same color
      var sorted = [];
      for (var c in colors) {
        sorted.push([c, colors[c]]);
      }
      sorted.sort(function(a, b) { return b[1] - a[1]; });

      // Attribute colors
      var colors_code = createColorPalette(sorted.length);
      for (var i = 0; i < sorted.length; i++) {
        colors[sorted[i][0]] = {name: sorted[i][0], color: colors_code[i]};
      }
      $scope.colors = colors;

    }

  });
});
