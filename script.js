/*jslint browser: true, vars: true, indent: 3 */

var startUniverse = function () {
   'use strict';

   var universeCanvas = document.getElementById('universe');
   var universeContext = universeCanvas && universeCanvas.getContext && universeCanvas.getContext('2d');
   if (!universeContext) {
      document.getElementById('instructions').innerHTML = 'Your browser does not seem to support the <code>&lt;canvas&gt;</code> element correctly.&nbsp; Please use a recent version of a standards-compliant browser such as <a href="http://www.opera.com/">Opera</a>, <a href="http://www.google.com/chrome/">Chrome</a> or <a href="http://www.getfirefox.com/">Firefox</a>.';
      window.alert('Your browser does not seem to support the <canvas> element correctly.\nPlease use a recent version of a standards-compliant browser such as Opera, Chrome or Firefox.');
      return;
   }

   var numCellsWide, cellWidth, numCellsTall, cellHeight;
   var cellValues = [];
   var cellValueColors;
   var numCellValues;
   var cyclicRadio = document.getElementById('cyclic-mode');
   var driftRadio = document.getElementById('drift-mode');
   var gameRadio = document.getElementById('game-mode');
   var moduloRadio = document.getElementById('modulo-mode');
   var totalisticRadio = document.getElementById('totalistic-mode');
   var vineyardRadio = document.getElementById('vineyard-mode');
   var wolframRuleRadio = document.getElementById('wolfram-rule-mode');
   var gameNeighborhoodArea = document.getElementById('game-neighborhood-area');
   var neighborhoodArea = document.getElementById('neighborhood-area');
   var totalisticRulesArea = document.getElementById('totalistic-rules-area');
   var wolframRuleRulesArea = document.getElementById('wolfram-rule-rules-area');
   var copyLeftDownCheckbox = document.getElementById('copy-left-down');
   var copyLeftCheckbox = document.getElementById('copy-left');
   var copyLeftUpCheckbox = document.getElementById('copy-left-up');
   var copyUpCheckbox = document.getElementById('copy-up');
   var copyRightUpCheckbox = document.getElementById('copy-right-up');
   var copyRightCheckbox = document.getElementById('copy-right');
   var copyRightDownCheckbox = document.getElementById('copy-right-down');
   var copyDownCheckbox = document.getElementById('copy-down');
   var surviveCheckbox = [document.getElementById('survive-0'), document.getElementById('survive-1'), document.getElementById('survive-2'),
                          document.getElementById('survive-3'), document.getElementById('survive-4'), document.getElementById('survive-5'),
                          document.getElementById('survive-6'), document.getElementById('survive-7'), document.getElementById('survive-8')];
   var bornCheckbox = [document.getElementById('born-0'), document.getElementById('born-1'), document.getElementById('born-2'),
                       document.getElementById('born-3'), document.getElementById('born-4'), document.getElementById('born-5'),
                       document.getElementById('born-6'), document.getElementById('born-7'), document.getElementById('born-8')];
   var onCheckbox = [document.getElementById('on-0'), document.getElementById('on-1'), document.getElementById('on-2'), document.getElementById('on-3'),
                     document.getElementById('on-4'), document.getElementById('on-5'), document.getElementById('on-6'), document.getElementById('on-7')];

   var resizeUniverse = function (newNumCellsWide, newNumCellsTall) {
      var cellX, cellY;
      numCellsWide = newNumCellsWide;
      cellWidth = universeCanvas.width / numCellsWide;
      numCellsTall = newNumCellsTall;
      cellHeight = universeCanvas.height / numCellsTall;

      // initialize cell values
      for (cellX = 0; cellX < numCellsWide; cellX += 1) {
         cellValues[cellX] = [];
         for (cellY = 0; cellY < numCellsTall; cellY += 1) {
            cellValues[cellX][cellY] = 0;
         }
      }
   };

   Array.prototype.peek = function (fromTop) {
      return fromTop ? this[this.length - fromTop - 1] : this[this.length - 1];
   };

   var randomizeUniverse = function () {
      var cellX, cellY;
      for (cellX = 0; cellX < numCellsWide; cellX += 1) {
         for (cellY = 0; cellY < numCellsTall; cellY += 1) {
            cellValues[cellX][cellY] = Math.floor(Math.random() * numCellValues);
         }
      }
   };

   var redrawUniverse = function () {
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

   var advanceGenerationCyclic = function () {
      var cellX, cellXLeft, cellXRight, cellY, cellYDown, cellYUp, nextCellValue, shouldAdvance;
      var newCellValues = [];

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
            if (copyLeftDownCheckbox.checked && cellValues[cellXLeft][cellYDown] === nextCellValue) {
               shouldAdvance = true;
            } else if (copyLeftCheckbox.checked && cellValues[cellXLeft][cellY] === nextCellValue) {
               shouldAdvance = true;
            } else if (copyLeftUpCheckbox.checked && cellValues[cellXLeft][cellYUp] === nextCellValue) {
               shouldAdvance = true;
            } else if (copyUpCheckbox.checked && cellValues[cellX][cellYUp] === nextCellValue) {
               shouldAdvance = true;
            } else if (copyRightUpCheckbox.checked && cellValues[cellXRight][cellYUp] === nextCellValue) {
               shouldAdvance = true;
            } else if (copyRightCheckbox.checked && cellValues[cellXRight][cellY] === nextCellValue) {
               shouldAdvance = true;
            } else if (copyRightDownCheckbox.checked && cellValues[cellXRight][cellYDown] === nextCellValue) {
               shouldAdvance = true;
            } else if (copyDownCheckbox.checked && cellValues[cellX][cellYDown] === nextCellValue) {
               shouldAdvance = true;
            }
            if (shouldAdvance) {
               newCellValues[cellX][cellY] = nextCellValue;
            } else {
               newCellValues[cellX][cellY] = cellValues[cellX][cellY];
            }
         }
      }

      // make new cell values current cell values
      cellValues = newCellValues;
   };

   var advanceGenerationCyclistic = function () {
      var cellX, cellXLeft, cellXRight, cellY, cellYDown, cellYUp, nextCellValue, total;
      var newCellValues = [];

      // calculate new cell values
      for (cellX = 0; cellX < numCellsWide; cellX += 1) {
         newCellValues[cellX] = [];
         for (cellY = 0; cellY < numCellsTall; cellY += 1) {
            cellXLeft = (cellX + numCellsWide - 1) % numCellsWide;
            cellXRight = (cellX + 1) % numCellsWide;
            cellYUp = (cellY + numCellsTall - 1) % numCellsTall;
            cellYDown = (cellY + 1) % numCellsTall;
            nextCellValue = (cellValues[cellX][cellY] + 1) % numCellValues;
            total = (cellValues[cellXLeft][cellYUp] + cellValues[cellXLeft][cellY] + cellValues[cellX][cellYUp] + cellValues[cellX][cellY] + cellValues[cellX][cellYDown] + cellValues[cellXRight][cellY] + cellValues[cellXRight][cellYDown]) % numCellValues;
            if (total === numCellValues - 1) {
               newCellValues[cellX][cellY] = nextCellValue;
            } else {
               newCellValues[cellX][cellY] = cellValues[cellX][cellY];
            }
         }
      }

      // make new cell values current cell values
      cellValues = newCellValues;
   };

   var advanceGenerationDrift = function () {
      var cellX, cellXLeft, cellXRight, cellY, cellYDown, cellYUp;
      var newCellValues = [];

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

   var ipdRandom = function (historyFocal, historyOpponent) {
      return Math.random() < 0.5 ? 0 : 1;
   };

   var ipdAlwaysCooperate = function (historyFocal, historyOpponent) {
      return 0;
   };

   var ipdAlwaysDefect = function (historyFocal, historyOpponent) {
      return 1;
   };

   var ipdNiceTitForTat = function (historyFocal, historyOpponent) {
      if (historyOpponent.length > 0) {
         return historyOpponent.peek();
      } else {
         return 0;
      }
   };

   var ipdNastyTitForTat = function (historyFocal, historyOpponent) {
      if (historyOpponent.length > 0) {
         return historyOpponent.peek();
      } else {
         return 1;
      }
   };

   var ipdNicePavlov = function (historyFocal, historyOpponent) {
      if (historyFocal.length > 0 && historyOpponent.length > 0) {
         return historyFocal.peek() === historyOpponent.peek() ? 0 : 1;
      } else {
         return 0;
      }
   };

   var ipdNastyPavlov = function (historyFocal, historyOpponent) {
      if (historyFocal.length > 0 && historyOpponent.length > 0) {
         return historyFocal.peek() === historyOpponent.peek() ? 0 : 1;
      } else {
         return 1;
      }
   };

   var ipdNiceDelayedPavlov = function (historyFocal, historyOpponent) {
      if (historyFocal.length > 1 && historyOpponent.length > 0) {
         return historyFocal.peek(1) === historyOpponent.peek() ? 0 : 1;
      } else if (historyOpponent.length > 0) {
         return historyOpponent.peek();
      } else {
         return 0;
      }
   };

   var ipdNastyDelayedPavlov = function (historyFocal, historyOpponent) {
      if (historyFocal.length > 1 && historyOpponent.length > 0) {
         return historyFocal.peek(1) === historyOpponent.peek() ? 0 : 1;
      } else if (historyOpponent.length > 0) {
         return 1 - historyOpponent.peek();
      } else {
         return 1;
      }
   };

   var ipdFuncs = [];
   ipdFuncs.push(ipdRandom);
   ipdFuncs.push(ipdAlwaysCooperate);
   ipdFuncs.push(ipdAlwaysDefect);
   ipdFuncs.push(ipdNiceTitForTat);
   ipdFuncs.push(ipdNastyTitForTat);
   ipdFuncs.push(ipdNicePavlov);
   ipdFuncs.push(ipdNastyPavlov);
   ipdFuncs.push(ipdNiceDelayedPavlov);
   ipdFuncs.push(ipdNastyDelayedPavlov);

   var ipdPayoffs = function (strat1, strat2) {
      var cooperatePayoff = 5;
      var defectPayoff = 4;
      return strat1 === 0 ? strat2 === 0 ? [cooperatePayoff, cooperatePayoff] : [0, cooperatePayoff + defectPayoff] : strat2 === 0 ? [cooperatePayoff + defectPayoff, 0] : [defectPayoff, defectPayoff];
   };

   var playIpd = function (agent0, agent1, numRounds) {
      var payoffs, whichRound;
      var history = [[], []];
      var strat = [];
      var totals = [0, 0];
      for (whichRound = 0; whichRound < numRounds; whichRound += 1) {
         strat[0] = ipdFuncs[agent0](history[0], history[1]);
         strat[1] = ipdFuncs[agent1](history[1], history[0]);
         history[0].push(strat[0]);
         history[1].push(strat[1]);
         payoffs = ipdPayoffs(strat[0], strat[1]);
         totals[0] += payoffs[0];
         totals[1] += payoffs[1];
      }
      return totals;
   };

   var advanceGenerationGame = function () {
      var bestCellValues, bestScore, cellScore, cellX, cellXLeft, cellXRight, cellY, cellYDown, cellYUp, localCells, points, whichCell;
      var cellScores = [];
      var newCellValues = [];
      var numRounds = 10;

      // initialize scores and mutate some cells
      for (cellX = 0; cellX < numCellsWide; cellX += 1) {
         cellScores[cellX] = [];
         for (cellY = 0; cellY < numCellsTall; cellY += 1) {
            cellScores[cellX][cellY] = 0;
            if (Math.random() < 1 / (numCellsTall + numCellsWide)) {
               cellValues[cellX][cellY] = Math.floor(Math.random() * numCellValues);
            }
         }
      }

      // play IPD in pairs
      for (cellX = 0; cellX < numCellsWide; cellX += 1) {
         for (cellY = 0; cellY < numCellsTall; cellY += 1) {
            cellXRight = (cellX + 1) % numCellsWide;
            cellYDown = (cellY + 1) % numCellsTall;
            points = playIpd(cellValues[cellX][cellY], cellValues[cellX][cellYDown], numRounds);
            cellScores[cellX][cellY] += points[0];
            cellScores[cellX][cellYDown] += points[1];
            points = playIpd(cellValues[cellX][cellY], cellValues[cellXRight][cellY], numRounds);
            cellScores[cellX][cellY] += points[0];
            cellScores[cellXRight][cellY] += points[1];
            points = playIpd(cellValues[cellX][cellY], cellValues[cellXRight][cellYDown], numRounds);
            cellScores[cellX][cellY] += points[0];
            cellScores[cellXRight][cellYDown] += points[1];
         }
      }

      // calculate new cell values
      for (cellX = 0; cellX < numCellsWide; cellX += 1) {
         newCellValues[cellX] = [];
         for (cellY = 0; cellY < numCellsTall; cellY += 1) {
            cellXLeft = (cellX + numCellsWide - 1) % numCellsWide;
            cellXRight = (cellX + 1) % numCellsWide;
            cellYUp = (cellY + numCellsTall - 1) % numCellsTall;
            cellYDown = (cellY + 1) % numCellsTall;
            localCells = [
               [cellXLeft, cellYUp],
               [cellXLeft, cellY],
               [cellX, cellYUp],
               [cellX, cellY],
               [cellX, cellYDown],
               [cellXRight, cellY],
               [cellXRight, cellYDown]
            ];
            bestScore = Number.NEGATIVE_INFINITY;
            for (whichCell = 0; whichCell < localCells.length; whichCell += 1) {
               cellScore = cellScores[localCells[whichCell][0]][localCells[whichCell][1]];
               if (cellScore > bestScore) {
                  bestCellValues = [cellValues[localCells[whichCell][0]][localCells[whichCell][1]]];
                  bestCellValues = [];
                  bestCellValues.push(cellValues[localCells[whichCell][0]][localCells[whichCell][1]]);
                  bestScore = cellScore;
               } else if (cellScore === bestScore) {
                  bestCellValues.push(cellValues[localCells[whichCell][0]][localCells[whichCell][1]]);
               }
            }
            newCellValues[cellX][cellY] = bestCellValues[Math.floor(Math.random() * bestCellValues.length)];
         }
      }

      // make new cell values current cell values
      cellValues = newCellValues;
   };

   var advanceGenerationModulo = function () {
      var cellX, cellXLeft, cellXRight, cellY, cellYDown, cellYUp;
      var newCellValues = [];

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

   var advanceGenerationTotalistic = function () {
      var cellX, cellXLeft, cellXRight, cellY, cellYDown, cellYUp, total;
      var newCellValues = [];

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

   var advanceGenerationVineyard = function () {
      var cellX, cellXLeft, cellXRight, cellY, cellYDown, cellYUp;
      var newCellValues = [];
      var numHigher, numLower;

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
            if (copyLeftDownCheckbox.checked) {
               if (cellValues[cellXLeft][cellYDown] > cellValues[cellX][cellY]) {
                  numHigher += 1;
               } else if (cellValues[cellXLeft][cellYDown] < cellValues[cellX][cellY]) {
                  numLower += 1;
               }
            }
            if (copyLeftCheckbox.checked) {
               if (cellValues[cellXLeft][cellY] > cellValues[cellX][cellY]) {
                  numHigher += 1;
               } else if (cellValues[cellXLeft][cellY] < cellValues[cellX][cellY]) {
                  numLower += 1;
               }
            }
            if (copyLeftUpCheckbox.checked) {
               if (cellValues[cellXLeft][cellYUp] > cellValues[cellX][cellY]) {
                  numHigher += 1;
               } else if (cellValues[cellXLeft][cellYUp] < cellValues[cellX][cellY]) {
                  numLower += 1;
               }
            }
            if (copyUpCheckbox.checked) {
               if (cellValues[cellX][cellYUp] > cellValues[cellX][cellY]) {
                  numHigher += 1;
               } else if (cellValues[cellX][cellYUp] < cellValues[cellX][cellY]) {
                  numLower += 1;
               }
            }
            if (copyRightUpCheckbox.checked) {
               if (cellValues[cellXRight][cellYUp] > cellValues[cellX][cellY]) {
                  numHigher += 1;
               } else if (cellValues[cellXRight][cellYUp] < cellValues[cellX][cellY]) {
                  numLower += 1;
               }
            }
            if (copyRightCheckbox.checked) {
               if (cellValues[cellXRight][cellY] > cellValues[cellX][cellY]) {
                  numHigher += 1;
               } else if (cellValues[cellXRight][cellY] < cellValues[cellX][cellY]) {
                  numLower += 1;
               }
            }
            if (copyRightDownCheckbox.checked) {
               if (cellValues[cellXRight][cellYDown] > cellValues[cellX][cellY]) {
                  numHigher += 1;
               } else if (cellValues[cellXRight][cellYDown] < cellValues[cellX][cellY]) {
                  numLower += 1;
               }
            }
            if (copyDownCheckbox.checked) {
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

   var advanceGenerationWolframRule = function () {
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

   var advanceGeneration = null;

   cyclicRadio.onclick = function () {
      if (advanceGeneration !== advanceGenerationCyclic) {
         advanceGeneration = advanceGenerationCyclic;
         gameNeighborhoodArea.style.display = 'none';
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

   driftRadio.onclick = function () {
      if (advanceGeneration !== advanceGenerationDrift) {
         advanceGeneration = advanceGenerationDrift;
         gameNeighborhoodArea.style.display = 'none';
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

   gameRadio.onclick = function () {
      if (advanceGeneration !== advanceGenerationGame) {
         advanceGeneration = advanceGenerationGame;
         gameNeighborhoodArea.style.display = 'none';
         neighborhoodArea.style.display = 'none';
         totalisticRulesArea.style.display = 'none';
         wolframRuleRulesArea.style.display = 'none';
         resizeUniverse(105, 105);
         cellValueColors = ['#999999', '#00ff00', '#000000', '#00ffff', '#0000ff', '#ffff00', '#ff0000', '#ffffff', '#ff00ff'];
         numCellValues = cellValueColors.length;
         randomizeUniverse();
         redrawUniverse();
      }
   };
   if (gameRadio.checked) {
      gameRadio.onclick();
   }

   moduloRadio.onclick = function () {
      var cellX, cellY;
      if (advanceGeneration !== advanceGenerationModulo) {
         advanceGeneration = advanceGenerationModulo;
         gameNeighborhoodArea.style.display = 'none';
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

   totalisticRadio.onclick = function () {
      if (advanceGeneration !== advanceGenerationTotalistic) {
         advanceGeneration = advanceGenerationTotalistic;
         gameNeighborhoodArea.style.display = 'none';
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
      if (advanceGeneration !== advanceGenerationVineyard) {
         advanceGeneration = advanceGenerationVineyard;
         gameNeighborhoodArea.style.display = 'none';
         neighborhoodArea.style.display = '';
         totalisticRulesArea.style.display = 'none';
         wolframRuleRulesArea.style.display = 'none';
         resizeUniverse(105, 105);
         numCellValues = 256;
         cellValueColors = [];
         for (i = 0; i < numCellValues; i += 1) {
            cellValueColors.push('rgb(' + i + ', ' + i + ', ' + i + ')');
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
      if (advanceGeneration !== advanceGenerationWolframRule) {
         advanceGeneration = advanceGenerationWolframRule;
         gameNeighborhoodArea.style.display = 'none';
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
      copyLeftDownCheckbox.checked = true;
      copyLeftCheckbox.checked = true;
      copyLeftUpCheckbox.checked = true;
      copyUpCheckbox.checked = true;
      copyRightUpCheckbox.checked = true;
      copyRightCheckbox.checked = true;
      copyRightDownCheckbox.checked = true;
      copyDownCheckbox.checked = true;
   };

   document.getElementById('hex-neighborhood').onclick = function () {
      copyLeftDownCheckbox.checked = true;
      copyLeftCheckbox.checked = true;
      copyLeftUpCheckbox.checked = false;
      copyUpCheckbox.checked = true;
      copyRightUpCheckbox.checked = true;
      copyRightCheckbox.checked = true;
      copyRightDownCheckbox.checked = false;
      copyDownCheckbox.checked = true;
   };

   document.getElementById('vonneumann-neighborhood').onclick = function () {
      copyLeftDownCheckbox.checked = false;
      copyLeftCheckbox.checked = true;
      copyLeftUpCheckbox.checked = false;
      copyUpCheckbox.checked = true;
      copyRightUpCheckbox.checked = false;
      copyRightCheckbox.checked = true;
      copyRightDownCheckbox.checked = false;
      copyDownCheckbox.checked = true;
   };

   document.getElementById('obliquevonneumann-neighborhood').onclick = function () {
      copyLeftDownCheckbox.checked = true;
      copyLeftCheckbox.checked = false;
      copyLeftUpCheckbox.checked = true;
      copyUpCheckbox.checked = false;
      copyRightUpCheckbox.checked = true;
      copyRightCheckbox.checked = false;
      copyRightDownCheckbox.checked = true;
      copyDownCheckbox.checked = false;
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
      advanceGeneration();
      redrawUniverse();
   };

   universeCanvas.onmousedown = function () {
      advanceGeneration();
      redrawUniverse();
      document.onmousemove = function () {
         advanceGeneration();
         redrawUniverse();
      };
      document.onmouseup = function () {
         document.onmousemove = null;
      };
   };
};
