/*jslint bitwise: true, browser: true, indent: 3 */

(function () {
   'use strict';
   var advanceTimeStep, advanceTimeStepCyclic, advanceTimeStepDirectional, advanceTimeStepDrift, advanceTimeStepModulo, advanceTimeStepParallel, advanceTimeStepTotalistic, advanceTimeStepVineyard, advanceTimeStepWolframRule, bornCheckbox, cellHeight, cellValueColors, cellValues, cellWidth, cyclicRadio, directionalRadio, driftRadio, moduloRadio, neighborDownCheckbox, neighborLeftCheckbox, neighborLeftDownCheckbox, neighborLeftUpCheckbox, neighborRightCheckbox, neighborRightDownCheckbox, neighborRightUpCheckbox, neighborUpCheckbox, neighborhoodArea, numCellValues, numCellsTall, numCellsWide, onCheckbox, parallelRadio, randomizeUniverse, redrawUniverse, resizeUniverse, surviveCheckbox, totalisticRadio, totalisticRulesArea, universeCanvas, universeContext, vineyardRadio, wolframRuleRadio, wolframRuleRulesArea;

   universeCanvas = document.getElementById('universe');
   universeContext = universeCanvas && universeCanvas.getContext && universeCanvas.getContext('2d');
   if (!universeContext) {
      document.getElementById('instructions').innerHTML = 'Your browser does not seem to support the <code>&lt;canvas&gt;</code> element correctly.&nbsp; Please use a recent version of a standards-compliant browser such as <a href="http://www.opera.com/">Opera</a>, <a href="http://www.google.com/chrome/">Chrome</a> or <a href="http://www.getfirefox.com/">Firefox</a>.';
      window.alert('Your browser does not seem to support the <canvas> element correctly.\nPlease use a recent version of a standards-compliant browser such as Opera, Chrome or Firefox.');
      return;
   }
   universeCanvas.width = window.innerHeight > 945 ? 840 : 420;
   universeCanvas.height = window.innerHeight > 945 ? 840 : 420;

   cyclicRadio = document.getElementById('cyclic-mode');
   directionalRadio = document.getElementById('directional-mode');
   driftRadio = document.getElementById('drift-mode');
   moduloRadio = document.getElementById('modulo-mode');
   parallelRadio = document.getElementById('parallel-mode');
   totalisticRadio = document.getElementById('totalistic-mode');
   vineyardRadio = document.getElementById('vineyard-mode');
   wolframRuleRadio = document.getElementById('wolfram-rule-mode');
   neighborhoodArea = document.getElementById('neighborhood-area');
   totalisticRulesArea = document.getElementById('totalistic-rules-area');
   wolframRuleRulesArea = document.getElementById('wolfram-rule-rules-area');
   neighborLeftDownCheckbox = document.getElementById('neighbor-left-down');
   neighborLeftCheckbox = document.getElementById('neighbor-left');
   neighborLeftUpCheckbox = document.getElementById('neighbor-left-up');
   neighborUpCheckbox = document.getElementById('neighbor-up');
   neighborRightUpCheckbox = document.getElementById('neighbor-right-up');
   neighborRightCheckbox = document.getElementById('neighbor-right');
   neighborRightDownCheckbox = document.getElementById('neighbor-right-down');
   neighborDownCheckbox = document.getElementById('neighbor-down');
   surviveCheckbox = [document.getElementById('survive-0'), document.getElementById('survive-1'), document.getElementById('survive-2'),
                      document.getElementById('survive-3'), document.getElementById('survive-4'), document.getElementById('survive-5'),
                      document.getElementById('survive-6'), document.getElementById('survive-7'), document.getElementById('survive-8')];
   bornCheckbox = [document.getElementById('born-0'), document.getElementById('born-1'), document.getElementById('born-2'),
                   document.getElementById('born-3'), document.getElementById('born-4'), document.getElementById('born-5'),
                   document.getElementById('born-6'), document.getElementById('born-7'), document.getElementById('born-8')];
   onCheckbox = [document.getElementById('on-0'), document.getElementById('on-1'), document.getElementById('on-2'), document.getElementById('on-3'),
                 document.getElementById('on-4'), document.getElementById('on-5'), document.getElementById('on-6'), document.getElementById('on-7')];
   advanceTimeStep = null;

   resizeUniverse = function (newNumCellsWide, newNumCellsTall) {
      var cellX, cellY;
      numCellsWide = newNumCellsWide;
      cellWidth = universeCanvas.width / numCellsWide;
      numCellsTall = newNumCellsTall;
      cellHeight = universeCanvas.height / numCellsTall;

      // initialize cell values
      cellValues = [];
      for (cellX = 0; cellX < numCellsWide; cellX += 1) {
         cellValues[cellX] = [];
         for (cellY = 0; cellY < numCellsTall; cellY += 1) {
            cellValues[cellX][cellY] = 0;
         }
      }
   };
   resizeUniverse(105, 105);

   randomizeUniverse = function () {
      var cellX, cellY;
      for (cellX = 0; cellX < numCellsWide; cellX += 1) {
         for (cellY = 0; cellY < numCellsTall; cellY += 1) {
            cellValues[cellX][cellY] = Math.floor(Math.random() * numCellValues);
         }
      }
   };

   redrawUniverse = function () {
      var cellX, cellY;

      // fill canvas background to match page background
      universeContext.fillStyle = '#ddeeff';
      universeContext.fillRect(0, 0, universeCanvas.width, universeCanvas.height);

      // draw cells
      for (cellX = 0; cellX < numCellsWide; cellX += 1) {
         for (cellY = 0; cellY < numCellsTall; cellY += 1) {
            universeContext.fillStyle = cellValueColors[cellValues[cellX][cellY]];
            universeContext.fillRect(cellX * cellWidth, cellY * cellHeight, cellWidth, cellHeight);
         }
      }
   };

   advanceTimeStepCyclic = function () {
      var allowFallback, cellX, cellXLeft, cellXRight, cellY, cellYDown, cellYUp, newCellValues, nextCellValue, shouldAdvance;

      allowFallback = false;
      newCellValues = [];

      // calculate new cell values
      for (cellX = 0; cellX < numCellsWide; cellX += 1) {
         newCellValues[cellX] = [];
         for (cellY = 0; cellY < numCellsTall; cellY += 1) {
            cellXLeft = (cellX + numCellsWide - 1) % numCellsWide;
            cellXRight = (cellX + 1) % numCellsWide;
            cellYUp = (cellY + numCellsTall - 1) % numCellsTall;
            cellYDown = (cellY + 1) % numCellsTall;
            nextCellValue = (cellValues[cellX][cellY] + 1) % numCellValues;
            shouldAdvance = false;
            if (neighborLeftDownCheckbox.checked && cellValues[cellXLeft][cellYDown] === nextCellValue) {
               shouldAdvance = true;
            } else if (neighborLeftCheckbox.checked && cellValues[cellXLeft][cellY] === nextCellValue) {
               shouldAdvance = true;
            } else if (neighborLeftUpCheckbox.checked && cellValues[cellXLeft][cellYUp] === nextCellValue) {
               shouldAdvance = true;
            } else if (neighborUpCheckbox.checked && cellValues[cellX][cellYUp] === nextCellValue) {
               shouldAdvance = true;
            } else if (neighborRightUpCheckbox.checked && cellValues[cellXRight][cellYUp] === nextCellValue) {
               shouldAdvance = true;
            } else if (neighborRightCheckbox.checked && cellValues[cellXRight][cellY] === nextCellValue) {
               shouldAdvance = true;
            } else if (neighborRightDownCheckbox.checked && cellValues[cellXRight][cellYDown] === nextCellValue) {
               shouldAdvance = true;
            } else if (neighborDownCheckbox.checked && cellValues[cellX][cellYDown] === nextCellValue) {
               shouldAdvance = true;
            }
            if (shouldAdvance) {
               newCellValues[cellX][cellY] = nextCellValue;
            } else {
               if (allowFallback) {
                  shouldAdvance = true;
                  if (neighborLeftDownCheckbox.checked && cellValues[cellXLeft][cellYDown] !== cellValues[cellX][cellY]) {
                     shouldAdvance = false;
                  } else if (neighborLeftCheckbox.checked && cellValues[cellXLeft][cellY] !== cellValues[cellX][cellY]) {
                     shouldAdvance = false;
                  } else if (neighborLeftUpCheckbox.checked && cellValues[cellXLeft][cellYUp] !== cellValues[cellX][cellY]) {
                     shouldAdvance = false;
                  } else if (neighborUpCheckbox.checked && cellValues[cellX][cellYUp] !== cellValues[cellX][cellY]) {
                     shouldAdvance = false;
                  } else if (neighborRightUpCheckbox.checked && cellValues[cellXRight][cellYUp] !== cellValues[cellX][cellY]) {
                     shouldAdvance = false;
                  } else if (neighborRightCheckbox.checked && cellValues[cellXRight][cellY] !== cellValues[cellX][cellY]) {
                     shouldAdvance = false;
                  } else if (neighborRightDownCheckbox.checked && cellValues[cellXRight][cellYDown] !== cellValues[cellX][cellY]) {
                     shouldAdvance = false;
                  } else if (neighborDownCheckbox.checked && cellValues[cellX][cellYDown] !== cellValues[cellX][cellY]) {
                     shouldAdvance = false;
                  }
               }
               if (shouldAdvance) {
                  newCellValues[cellX][cellY] = (cellValues[cellX][cellY] + numCellValues - 1) % numCellValues;
               } else {
                  newCellValues[cellX][cellY] = cellValues[cellX][cellY];
               }
            }
         }
      }

      // make new cell values current cell values
      cellValues = newCellValues;
   };

   advanceTimeStepDirectional = function () {
      var cellX, cellXLeft, cellXRight, cellY, cellYDown, cellYUp, newCellValues;

      newCellValues = [];

      // calculate new cell values
      for (cellX = 0; cellX < numCellsWide; cellX += 1) {
         newCellValues[cellX] = [];
         for (cellY = 0; cellY < numCellsTall; cellY += 1) {
            cellXLeft = (cellX + numCellsWide - 1) % numCellsWide;
            cellXRight = (cellX + 1) % numCellsWide;
            cellYUp = (cellY + numCellsTall - 1) % numCellsTall;
            cellYDown = (cellY + 1) % numCellsTall;
            if (cellValues[cellX][cellY] === 0) {
               newCellValues[cellX][cellY] = cellValues[cellX][cellYDown];
            } else if (cellValues[cellX][cellY] === 1) {
               newCellValues[cellX][cellY] = cellValues[cellXLeft][cellYDown];
            } else if (cellValues[cellX][cellY] === 2) {
               newCellValues[cellX][cellY] = cellValues[cellXLeft][cellY];
            } else if (cellValues[cellX][cellY] === 3) {
               newCellValues[cellX][cellY] = cellValues[cellX][cellYUp];
            } else if (cellValues[cellX][cellY] === 4) {
               newCellValues[cellX][cellY] = cellValues[cellXRight][cellYUp];
            } else if (cellValues[cellX][cellY] === 5) {
               newCellValues[cellX][cellY] = cellValues[cellXRight][cellY];
            } else {
               newCellValues[cellX][cellY] = cellValues[cellX][cellY];
            }
         }
      }

      // make new cell values current cell values
      cellValues = newCellValues;
   };

   advanceTimeStepDrift = function () {
      var cellX, cellXLeft, cellXRight, cellY, cellYDown, cellYUp, newCellValues;

      newCellValues = [];

      // calculate new cell values
      for (cellX = 0; cellX < numCellsWide; cellX += 1) {
         newCellValues[cellX] = [];
         for (cellY = 0; cellY < numCellsTall; cellY += 1) {
            cellXLeft = (cellX + numCellsWide - 1) % numCellsWide;
            cellXRight = (cellX + 1) % numCellsWide;
            cellYUp = (cellY + numCellsTall - 1) % numCellsTall;
            cellYDown = (cellY + 1) % numCellsTall;
            newCellValues[cellX][cellY] = Math.random() < 0.5 ? cellValues[cellX][cellY] : Math.random() < 0.5 ? Math.random() < 0.5 ? cellValues[cellXLeft][cellY] : cellValues[cellXRight][cellY] : Math.random() < 0.5 ? cellValues[cellX][cellYUp] : cellValues[cellX][cellYDown];
         }
      }

      // make new cell values current cell values
      cellValues = newCellValues;
   };

   advanceTimeStepModulo = function () {
      var cellX, cellXLeft, cellXRight, cellY, cellYDown, cellYUp, newCellValues;

      newCellValues = [];

      // calculate new cell values
      for (cellX = 0; cellX < numCellsWide; cellX += 1) {
         newCellValues[cellX] = [];
         for (cellY = 0; cellY < numCellsTall; cellY += 1) {
            cellXLeft = (cellX + numCellsWide - 1) % numCellsWide;
            cellXRight = (cellX + 1) % numCellsWide;
            cellYUp = (cellY + numCellsTall - 1) % numCellsTall;
            cellYDown = (cellY + 1) % numCellsTall;
            newCellValues[cellX][cellY] = (cellValues[cellXLeft][cellY] + cellValues[cellX][cellYUp]) % numCellValues;
         }
      }

      // make new cell values current cell values
      cellValues = newCellValues;
   };

   advanceTimeStepParallel = function () {
      var cellX, cellXLeft, cellXRight, cellY, cellYDown, cellYUp, newCellValues;

      newCellValues = [];

      // calculate new cell values
      for (cellX = 0; cellX < numCellsWide; cellX += 1) {
         newCellValues[cellX] = [];
         for (cellY = 0; cellY < numCellsTall; cellY += 1) {
            cellXLeft = (cellX + numCellsWide - 1) % numCellsWide;
            cellXRight = (cellX + 1) % numCellsWide;
            cellYUp = (cellY + numCellsTall - 1) % numCellsTall;
            cellYDown = (cellY + 1) % numCellsTall;

            newCellValues[cellX][cellY] = 0;
            if ((4 & cellValues[cellXLeft][cellY]) + (4 & cellValues[cellX][cellY]) + (4 & cellValues[cellX][cellYUp]) + (4 & cellValues[cellXRight][cellYUp]) + (4 & cellValues[cellXRight][cellY]) > 8) {
               newCellValues[cellX][cellY] |= 4;
            }
            if ((2 & cellValues[cellX][cellYDown]) + (2 & cellValues[cellX][cellY]) + (2 & cellValues[cellXRight][cellY]) + (2 & cellValues[cellXRight][cellYUp]) + (2 & cellValues[cellXLeft][cellYDown]) > 4) {
               newCellValues[cellX][cellY] |= 2;
            }
            if ((1 & cellValues[cellX][cellY]) + (1 & cellValues[cellXLeft][cellYDown]) + (1 & cellValues[cellX][cellYDown]) + (1 & cellValues[cellX][cellYUp]) + (1 & cellValues[cellXLeft][cellY]) > 2) {
               newCellValues[cellX][cellY] |= 1;
            }
         }
      }

      // make new cell values current cell values
      cellValues = newCellValues;
   };

   advanceTimeStepTotalistic = function () {
      var cellX, cellXLeft, cellXRight, cellY, cellYDown, cellYUp, newCellValues, total;

      newCellValues = [];

      // calculate new cell values
      for (cellX = 0; cellX < numCellsWide; cellX += 1) {
         newCellValues[cellX] = [];
         for (cellY = 0; cellY < numCellsTall; cellY += 1) {
            cellXLeft = (cellX + numCellsWide - 1) % numCellsWide;
            cellXRight = (cellX + 1) % numCellsWide;
            cellYUp = (cellY + numCellsTall - 1) % numCellsTall;
            cellYDown = (cellY + 1) % numCellsTall;
            total = cellValues[cellXLeft][cellYUp] + cellValues[cellXLeft][cellY] + cellValues[cellXLeft][cellYDown] + cellValues[cellX][cellYUp] + cellValues[cellX][cellY] + cellValues[cellX][cellYDown] + cellValues[cellXRight][cellYUp] + cellValues[cellXRight][cellY] + cellValues[cellXRight][cellYDown];
            newCellValues[cellX][cellY] = cellValues[cellX][cellY] === 1 ? surviveCheckbox[total - 1].checked ? 1 : 0 : bornCheckbox[total].checked ? 1 : 0;
         }
      }

      // make new cell values current cell values
      cellValues = newCellValues;
   };

   advanceTimeStepVineyard = function () {
      var cellX, cellXLeft, cellXRight, cellY, cellYDown, cellYUp, newCellValues, numHigher, numLower;

      newCellValues = [];

      // calculate new cell values
      for (cellX = 0; cellX < numCellsWide; cellX += 1) {
         newCellValues[cellX] = [];
         for (cellY = 0; cellY < numCellsTall; cellY += 1) {
            cellXLeft = (cellX + numCellsWide - 1) % numCellsWide;
            cellXRight = (cellX + 1) % numCellsWide;
            cellYUp = (cellY + numCellsTall - 1) % numCellsTall;
            cellYDown = (cellY + 1) % numCellsTall;
            numHigher = 0;
            numLower = 0;
            if (neighborLeftDownCheckbox.checked) {
               if (cellValues[cellXLeft][cellYDown] > cellValues[cellX][cellY]) {
                  numHigher += 1;
               } else if (cellValues[cellXLeft][cellYDown] < cellValues[cellX][cellY]) {
                  numLower += 1;
               }
            }
            if (neighborLeftCheckbox.checked) {
               if (cellValues[cellXLeft][cellY] > cellValues[cellX][cellY]) {
                  numHigher += 1;
               } else if (cellValues[cellXLeft][cellY] < cellValues[cellX][cellY]) {
                  numLower += 1;
               }
            }
            if (neighborLeftUpCheckbox.checked) {
               if (cellValues[cellXLeft][cellYUp] > cellValues[cellX][cellY]) {
                  numHigher += 1;
               } else if (cellValues[cellXLeft][cellYUp] < cellValues[cellX][cellY]) {
                  numLower += 1;
               }
            }
            if (neighborUpCheckbox.checked) {
               if (cellValues[cellX][cellYUp] > cellValues[cellX][cellY]) {
                  numHigher += 1;
               } else if (cellValues[cellX][cellYUp] < cellValues[cellX][cellY]) {
                  numLower += 1;
               }
            }
            if (neighborRightUpCheckbox.checked) {
               if (cellValues[cellXRight][cellYUp] > cellValues[cellX][cellY]) {
                  numHigher += 1;
               } else if (cellValues[cellXRight][cellYUp] < cellValues[cellX][cellY]) {
                  numLower += 1;
               }
            }
            if (neighborRightCheckbox.checked) {
               if (cellValues[cellXRight][cellY] > cellValues[cellX][cellY]) {
                  numHigher += 1;
               } else if (cellValues[cellXRight][cellY] < cellValues[cellX][cellY]) {
                  numLower += 1;
               }
            }
            if (neighborRightDownCheckbox.checked) {
               if (cellValues[cellXRight][cellYDown] > cellValues[cellX][cellY]) {
                  numHigher += 1;
               } else if (cellValues[cellXRight][cellYDown] < cellValues[cellX][cellY]) {
                  numLower += 1;
               }
            }
            if (neighborDownCheckbox.checked) {
               if (cellValues[cellX][cellYDown] > cellValues[cellX][cellY]) {
                  numHigher += 1;
               } else if (cellValues[cellX][cellYDown] < cellValues[cellX][cellY]) {
                  numLower += 1;
               }
            }
            if (numHigher > numLower) {
               newCellValues[cellX][cellY] = cellValues[cellX][cellY] < numCellValues - 1 ? (cellValues[cellX][cellY] + 1) % numCellValues : cellValues[cellX][cellY];
            } else if (numHigher < numLower) {
               newCellValues[cellX][cellY] = cellValues[cellX][cellY] > 0 ? (cellValues[cellX][cellY] + numCellValues - 1) % numCellValues : cellValues[cellX][cellY];
            } else {
               newCellValues[cellX][cellY] = cellValues[cellX][cellY];
            }
         }
      }

      // make new cell values current cell values
      cellValues = newCellValues;
   };

   advanceTimeStepWolframRule = function () {
      var cellX, cellXLeft, cellXRight, cellY, cellYDown, cellYUp;

      // calculate new cell values, directly replacing the old ones
      for (cellY = 0; cellY < numCellsTall; cellY += 1) {
         cellYUp = (cellY + numCellsTall - 1) % numCellsTall;
         cellYDown = (cellY + 1) % numCellsTall;
         for (cellX = 0; cellX < numCellsWide; cellX += 1) {
            cellXLeft = (cellX + numCellsWide - 1) % numCellsWide;
            cellXRight = (cellX + 1) % numCellsWide;
            if (cellY < numCellsTall - 1) {
               cellValues[cellX][cellY] = cellValues[cellX][cellYDown];
            } else {
               cellValues[cellX][cellY] = onCheckbox[4 * cellValues[cellXLeft][cellYUp] + 2 * cellValues[cellX][cellYUp] + cellValues[cellXRight][cellYUp]].checked ? 1 : 0;
            }
         }
      }
   };

   cyclicRadio.onclick = function () {
      if (advanceTimeStep !== advanceTimeStepCyclic) {
         advanceTimeStep = advanceTimeStepCyclic;
         neighborhoodArea.style.display = '';
         totalisticRulesArea.style.display = 'none';
         wolframRuleRulesArea.style.display = 'none';
         resizeUniverse(105, 105);
         cellValueColors = ['#0000ff', '#0033cc', '#006699', '#009966', '#00cc33', '#00ff00', '#33cc00', '#669900', '#996600', '#cc3300',
                            '#ff0000', '#cc0033', '#990066', '#660099', '#3300cc'];
         numCellValues = cellValueColors.length;
         randomizeUniverse();
         redrawUniverse();
      }
   };
   if (cyclicRadio.checked) {
      cyclicRadio.onclick();
   }

   directionalRadio.onclick = function () {
      if (advanceTimeStep !== advanceTimeStepDirectional) {
         advanceTimeStep = advanceTimeStepDirectional;
         neighborhoodArea.style.display = 'none';
         totalisticRulesArea.style.display = 'none';
         wolframRuleRulesArea.style.display = 'none';
         resizeUniverse(168, 168);
         cellValueColors = ['#0077ee', '#00ee77', '#77ee00', '#ee7700', '#ee0077', '#7700ee'];
         numCellValues = cellValueColors.length;
         randomizeUniverse();
         redrawUniverse();
      }
   };
   if (directionalRadio.checked) {
      directionalRadio.onclick();
   }

   driftRadio.onclick = function () {
      if (advanceTimeStep !== advanceTimeStepDrift) {
         advanceTimeStep = advanceTimeStepDrift;
         neighborhoodArea.style.display = 'none';
         totalisticRulesArea.style.display = 'none';
         wolframRuleRulesArea.style.display = 'none';
         resizeUniverse(40, 40);
         cellValueColors = ['#0000ff', '#0055aa', '#00aa55', '#00ff00', '#55aa00', '#555555', '#aa5500', '#ff0000', '#aa0055', '#5500aa'];
         numCellValues = cellValueColors.length;
         randomizeUniverse();
         redrawUniverse();
      }
   };
   if (driftRadio.checked) {
      driftRadio.onclick();
   }

   moduloRadio.onclick = function () {
      var cellX, cellY;
      if (advanceTimeStep !== advanceTimeStepModulo) {
         advanceTimeStep = advanceTimeStepModulo;
         neighborhoodArea.style.display = 'none';
         totalisticRulesArea.style.display = 'none';
         wolframRuleRulesArea.style.display = 'none';
         resizeUniverse(120, 120);
         cellValueColors = ['#000000', '#112233', '#224466', '#336699', '#4488cc', '#55aaff'];
         numCellValues = cellValueColors.length;
         for (cellX = 0; cellX < numCellsWide; cellX += 1) {
            for (cellY = 0; cellY < numCellsTall; cellY += 1) {
               cellValues[cellX][cellY] = cellX === 0 && cellY === 0 ? 2 : cellX === 0 || cellY === 0 ? 1 : 0;
            }
         }
         redrawUniverse();
      }
   };
   if (moduloRadio.checked) {
      moduloRadio.onclick();
   }

   parallelRadio.onclick = function () {
      if (advanceTimeStep !== advanceTimeStepParallel) {
         advanceTimeStep = advanceTimeStepParallel;
         neighborhoodArea.style.display = 'none';
         totalisticRulesArea.style.display = 'none';
         wolframRuleRulesArea.style.display = 'none';
         resizeUniverse(210, 210);
         cellValueColors = ['#000000', '#0000ff', '#00ff00', '#00ffff', '#ff0000', '#ff00ff', '#ffff00', '#ffffff'];
         numCellValues = cellValueColors.length;
         randomizeUniverse();
         redrawUniverse();
      }
   };
   if (parallelRadio.checked) {
      parallelRadio.onclick();
   }

   totalisticRadio.onclick = function () {
      if (advanceTimeStep !== advanceTimeStepTotalistic) {
         advanceTimeStep = advanceTimeStepTotalistic;
         neighborhoodArea.style.display = 'none';
         totalisticRulesArea.style.display = '';
         wolframRuleRulesArea.style.display = 'none';
         resizeUniverse(105, 105);
         cellValueColors = ['#ddeeff', '#001122'];
         numCellValues = cellValueColors.length;
         randomizeUniverse();
         redrawUniverse();
      }
   };
   if (totalisticRadio.checked) {
      totalisticRadio.onclick();
   }

   vineyardRadio.onclick = function () {
      var i;
      if (advanceTimeStep !== advanceTimeStepVineyard) {
         advanceTimeStep = advanceTimeStepVineyard;
         neighborhoodArea.style.display = '';
         totalisticRulesArea.style.display = 'none';
         wolframRuleRulesArea.style.display = 'none';
         resizeUniverse(105, 105);
         numCellValues = 256;
         cellValueColors = [];
         for (i = 0; i < numCellValues; i += 1) {
            cellValueColors.push('rgb(' + i + ', ' + i + ', ' + i + ')');
         }
         numCellValues = 128;
         cellValueColors = [];
         for (i = 0; i < numCellValues; i += 1) {
            cellValueColors.push('rgb(' + (127 - i) + ', ' + i + ', ' + (2 * i) + ')');
         }
         randomizeUniverse();
         redrawUniverse();
      }
   };
   if (vineyardRadio.checked) {
      vineyardRadio.onclick();
   }

   wolframRuleRadio.onclick = function () {
      var cellX, cellY;
      if (advanceTimeStep !== advanceTimeStepWolframRule) {
         advanceTimeStep = advanceTimeStepWolframRule;
         neighborhoodArea.style.display = 'none';
         totalisticRulesArea.style.display = 'none';
         wolframRuleRulesArea.style.display = '';
         resizeUniverse(120, 120);
         cellValueColors = ['#ddeeff', '#001122'];
         numCellValues = cellValueColors.length;
         randomizeUniverse();
         for (cellX = 0; cellX < numCellsWide; cellX += 1) {
            for (cellY = 0; cellY < numCellsTall - 1; cellY += 1) {
               cellValues[cellX][cellY] = 0;
            }
         }
         redrawUniverse();
      }
   };
   if (wolframRuleRadio.checked) {
      wolframRuleRadio.onclick();
   }

   document.getElementById('moore-neighborhood').onclick = function () {
      neighborLeftDownCheckbox.checked = true;
      neighborLeftCheckbox.checked = true;
      neighborLeftUpCheckbox.checked = true;
      neighborUpCheckbox.checked = true;
      neighborRightUpCheckbox.checked = true;
      neighborRightCheckbox.checked = true;
      neighborRightDownCheckbox.checked = true;
      neighborDownCheckbox.checked = true;
   };

   document.getElementById('hex-neighborhood').onclick = function () {
      neighborLeftDownCheckbox.checked = true;
      neighborLeftCheckbox.checked = true;
      neighborLeftUpCheckbox.checked = false;
      neighborUpCheckbox.checked = true;
      neighborRightUpCheckbox.checked = true;
      neighborRightCheckbox.checked = true;
      neighborRightDownCheckbox.checked = false;
      neighborDownCheckbox.checked = true;
   };

   document.getElementById('vonneumann-neighborhood').onclick = function () {
      neighborLeftDownCheckbox.checked = false;
      neighborLeftCheckbox.checked = true;
      neighborLeftUpCheckbox.checked = false;
      neighborUpCheckbox.checked = true;
      neighborRightUpCheckbox.checked = false;
      neighborRightCheckbox.checked = true;
      neighborRightDownCheckbox.checked = false;
      neighborDownCheckbox.checked = true;
   };

   document.getElementById('obliquevonneumann-neighborhood').onclick = function () {
      neighborLeftDownCheckbox.checked = true;
      neighborLeftCheckbox.checked = false;
      neighborLeftUpCheckbox.checked = true;
      neighborUpCheckbox.checked = false;
      neighborRightUpCheckbox.checked = true;
      neighborRightCheckbox.checked = false;
      neighborRightDownCheckbox.checked = true;
      neighborDownCheckbox.checked = false;
   };

   document.getElementById('gameoflife-rules').onclick = function () {
      var whichNumNeighbors;
      for (whichNumNeighbors = 0; whichNumNeighbors <= 8; whichNumNeighbors += 1) {
         surviveCheckbox[whichNumNeighbors].checked = false;
         bornCheckbox[whichNumNeighbors].checked = false;
      }
      surviveCheckbox[2].checked = true;
      surviveCheckbox[3].checked = true;
      bornCheckbox[3].checked = true;
   };

   document.getElementById('majorityvote-rules').onclick = function () {
      var whichNumNeighbors;
      for (whichNumNeighbors = 0; whichNumNeighbors <= 8; whichNumNeighbors += 1) {
         surviveCheckbox[whichNumNeighbors].checked = whichNumNeighbors >= 4;
         bornCheckbox[whichNumNeighbors].checked = whichNumNeighbors > 4;
      }
   };

   document.getElementById('randomize').onclick = function () {
      randomizeUniverse();
      redrawUniverse();
   };

   document.getElementById('advance').onclick = function () {
      advanceTimeStep();
      redrawUniverse();
   };

   universeCanvas.onmousedown = function () {
      advanceTimeStep();
      redrawUniverse();
      document.onmousemove = function () {
         advanceTimeStep();
         redrawUniverse();
      };
      document.onmouseup = function () {
         document.onmousemove = null;
      };
   };
}());
