<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <q-page
    class="flex flex-center"
    style="flex-wrap: wrap; flex-direction: column"
  >
    <q-card class="q-pa-lg">
      <div
        style="
          display: flex;
          flex-direction: row;
          justify-content: space-between;
        "
      >
        <div>
          <div class="text-h5"><strong>2048</strong></div>
          <p class="q-ma-none q-pa-none">{{ `分数:${score}` }}</p>
        </div>
        <div class="q-mt-auto">
          <q-btn :label="gaming ? '重新开始' : '开始'" @clicjiaoxnk="gameStart" />
        </div>
      </div>
      <div class="q-mt-md">
        <div id="grid_box" style="position: relative"></div>
      </div>
    </q-card>
  </q-page>
</template>
<script setup>
import $ from 'jquery';
import { onMounted } from 'vue';
import { ref } from 'vue';
import { useQuasar } from 'quasar';

const $q = useQuasar();
var cell_width = 80;
var cell_space = 10;
const cell_width_ref = ref(`${cell_width}px`);
var num_data = [];
const score = ref(0);
const gaming = ref(false);

onMounted(() => {
  gameStart();
});

function gameStart() {
  gaming.value = true;
  score.value = 0;
  // 创建元素
  $('#grid_box').empty();
  for (var i = 0; i < 4 * 4; i++) {
    var tmp_child_grid = document.createElement('div');
    tmp_child_grid.setAttribute('class', 'grid_cell');
    tmp_child_grid.setAttribute('id', `grid_cell_${parseInt(i / 4)}_${i % 4}`);
    $('#grid_box').append(tmp_child_grid);
  }
  $('#grid_box').css('width', cell_width * 4 + cell_space * 5);
  $('#grid_box').css('height', cell_width * 4 + cell_space * 5);
  $('.grid_cell').css('width', cell_width);
  $('.grid_cell').css('height', cell_width);
  for (var i = 0; i < 4; i++) {
    num_data[i] = [];
    for (var j = 0; j < 4; j++) {
      num_data[i].push(0);
      $(`#grid_cell_${i}_${j}`).css('top', getPosTop(i, j));
      $(`#grid_cell_${i}_${j}`).css('left', getPosLeft(i, j));
    }
  }
  updateNumView();
  genNewCell();
  genNewCell();
}
function getPosTop(r, c) {
  return r * cell_width + (r + 1) * cell_space;
}
function getPosLeft(r, c) {
  return c * cell_width + (c + 1) * cell_space;
}
function genNewCell() {
  var finished = false;
  while (!finished) {
    var x = Math.floor(Math.random() * 4);
    var y = Math.floor(Math.random() * 4);
    if (num_data[x][y] === 0) {
      num_data[x][y] = Math.random() < 0.5 ? 2 : 4;
      finished = true;
    }
  }
  var selected_item = $(`#grid_num_${x}_${y}`);
  selected_item.text(num_data[x][y]);
  selected_item.css(
    'background-color',
    getNumberBackgroundColor(num_data[x][y])
  );
  selected_item.css('color', getNumberColor(num_data[x][y]));
  selected_item.css('fontSize', getNumberTextStyle(num_data[x][y]));
  console.log(getNumberTextStyle(num_data[x][y]));
  selected_item.animate(
    {
      width: cell_width,
      height: cell_width,
      top: getPosTop(x, y),
      left: getPosLeft(x, y),
    },
    500
  );
}
function updateNumView() {
  $('.grid_num').remove();
  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 4; j++) {
      var tmp_child_number = document.createElement('div');
      tmp_child_number.setAttribute('class', 'grid_num');
      tmp_child_number.setAttribute('id', `grid_num_${i}_${j}`);
      $('#grid_box').append(tmp_child_number);
      tmp_child_number = $(`#grid_num_${i}_${j}`);
      if (num_data[i][j] > 0) {
        tmp_child_number.text(num_data[i][j]);
        tmp_child_number.css('width', cell_width);
        tmp_child_number.css('height', cell_width);
        tmp_child_number.css(
          'background-color',
          getNumberBackgroundColor(num_data[i][j])
        );
        tmp_child_number.css('color', getNumberColor(num_data[i][j]));
        tmp_child_number.css('fontSize', getNumberTextStyle(num_data[i][j]));

        tmp_child_number.css('top', i * cell_width + (i + 1) * cell_space);
        tmp_child_number.css('left', j * cell_width + (j + 1) * cell_space);
      } else {
        tmp_child_number.css('top', getPosTop(i, j) + 0.5 * cell_width);
        tmp_child_number.css('left', getPosLeft(i, j) + 0.5 * cell_width);
        tmp_child_number.css('width', 0);
        tmp_child_number.css('height', 0);
      }
    }
  }
}
function getNumberBackgroundColor(num) {
  switch (num) {
    case 2:
      return '#eee4da';
      break;
    case 4:
      return '#ede0c8';
      break;
    case 8:
      return '#f2b179';
      break;
    case 16:
      return '#f59563';
      break;
    case 32:
      return '#f67c5f';
      break;
    case 64:
      return '#f65e3b';
      break;
    case 128:
      return '#edcf72';
      break;
    case 256:
      return '#edcc61';
      break;
    case 512:
      return '#9c0';
      break;
    case 1024:
      return '#33b5e5';
      break;
    case 2048:
      return '#09c';
      break;
    case 4096:
      return '#a6c';
      break;
    case 8192:
      return '#93c';
      break;
  }
}
function getNumberColor(num) {
  if (num <= 4) {
    return '#776e65';
  } else {
    return '#fff';
  }
}
function getNumberTextStyle(num) {
  switch (num.toString().length) {
    case 1:
    case 2:
      return '50px';
    case 3:
      return '40px';
    case 4:
      return '30px';
  }
}

var startx = 0;
var starty = 0;
var endx = 0;
var endy = 0;
//实现键盘的响应
$(document).keydown(function (event) {
  //阻止事件的默认行为
  event.preventDefault();

  switch (event.keyCode) {
    case 37: //left
      //判断是否可以向左移动
      if (canMoveLeft()) {
        moveLeft();
        setTimeout(genNewCell, 200);
        setTimeout(IsGameOver, 500);
      }
      break;
    case 38: //up
      if (canMoveUp()) {
        moveUp();
        setTimeout(genNewCell, 200);
        setTimeout(IsGameOver, 500);
      }
      break;
    case 39: //right
      if (canMoveRight()) {
        moveRight();
        setTimeout(genNewCell, 200);
        setTimeout(IsGameOver, 500);
      }
      break;
    case 40: //down
      if (canMoveDown()) {
        moveDown();
        setTimeout(genNewCell, 200);
        setTimeout(IsGameOver, 500);
      }
      break;
    default:
      break;
  }
});

//实现触摸滑动响应
document.addEventListener('touchstart', function (event) {
  startx = event.touches[0].pageX;
  starty = event.touches[0].pageY;
});
document.addEventListener('touchend', function (event) {
  endx = event.changedTouches[0].pageX;
  endy = event.changedTouches[0].pageY;

  //判断滑动的方向
  var deltax = endx - startx;
  var deltay = endy - starty;

  //判断当滑动距离小于一定的阈值时不做任何操作
  if (
    Math.abs(deltax) < documentWidth * 0.08 &&
    Math.abs(deltay) < documentWidth * 0.08
  ) {
    return;
  }

  if (Math.abs(deltax) >= Math.abs(deltay)) {
    //水平方向移动
    if (deltax > 0) {
      //向右移动
      if (canMoveRight()) {
        moveRight();
        setTimeout(genNewCell, 200);
        setTimeout(IsGameOver, 500);
      }
    } else {
      //向左移动
      if (canMoveLeft()) {
        moveLeft();
        setTimeout(genNewCell, 200);
        setTimeout(IsGameOver, 500);
      }
    }
  } else {
    //垂直方向移动

    if (deltay > 0) {
      //向下移动
      if (canMoveDown()) {
        moveDown();
        setTimeout(genNewCell, 200);
        setTimeout(IsGameOver, 500);
      }
    } else {
      //向上移动
      if (canMoveUp()) {
        moveUp();
        setTimeout(genNewCell, 200);
        setTimeout(IsGameOver, 500);
      }
    }
  }
});

function moveLeft() {
  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 4; j++) {
      //j已经在最左边 所以从1开始
      if (num_data[i][j] != 0) {
        for (var k = 0; k < j; k++) {
          if (num_data[i][k] == 0 && noBlockHorizontal(i, k, j, num_data)) {
            //第I行的地k-j列是否有障碍物
            //移动操作
            showMoveAnimation(i, j, i, k);
            num_data[i][k] = num_data[i][j];
            num_data[i][j] = 0;
            break;
          } else if (
            num_data[i][k] == num_data[i][j] &&
            noBlockHorizontal(i, k, j, num_data)
          ) {
            //进行叠加
            showMoveAnimation(i, j, i, k);
            num_data[i][k] += num_data[i][j];
            num_data[i][j] = 0;
            //统计分数
            score.value += num_data[i][k];
            break;
          }
        }
      }
    }
  }

  //更新页面上的数字单元格，此处才是真正的更新显示移动后的效果
  setTimeout(updateNumView, 200); //等待500ms，为了让单元格移动效果能够显示完
}

function moveUp() {
  for (var j = 0; j < 4; j++) {
    for (var i = 1; i < 4; i++) {
      if (num_data[i][j] != 0) {
        for (var k = 0; k < i; k++) {
          if (num_data[k][j] == 0 && noBlockVertical(j, k, i, num_data)) {
            //第j列的第k-i行之间是否有障碍物
            showMoveAnimation(i, j, k, j);
            num_data[k][j] = num_data[i][j];
            num_data[i][j] = 0;
            break;
          } else if (
            num_data[k][j] == num_data[i][j] &&
            noBlockVertical(j, k, i, num_data)
          ) {
            showMoveAnimation(i, j, k, j);
            num_data[k][j] += num_data[i][j];
            num_data[i][j] = 0;
            score.value += num_data[k][j];

            break;
          }
        }
      }
    }
  }

  //更新页面上的数字单元格，此处才是真正的更新显示移动后的效果
  setTimeout(updateNumView, 200); //等待500ms，为了让单元格移动效果能够显示完
}

function moveRight() {
  for (var i = 0; i < 4; i++) {
    for (var j = 2; j >= 0; j--) {
      //j已经在最右边 所以没有3的挤压
      if (num_data[i][j] != 0) {
        for (var k = 3; k > j; k--) {
          if (num_data[i][k] == 0 && noBlockHorizontal(i, j, k, num_data)) {
            //第i行的地j-k列是否有障碍物
            //移动操作
            showMoveAnimation(i, j, i, k);
            num_data[i][k] = num_data[i][j];
            num_data[i][j] = 0;
            break;
          } else if (
            num_data[i][k] == num_data[i][j] &&
            noBlockHorizontal(i, j, k, num_data)
          ) {
            //进行叠加
            showMoveAnimation(i, j, i, k);
            num_data[i][k] += num_data[i][j];
            num_data[i][j] = 0;
            //统计分数
            score.value += num_data[i][k];

            break;
          }
        }
      }
    }
  }

  //更新页面上的数字单元格，此处才是真正的更新显示移动后的效果
  setTimeout(updateNumView, 200); //等待500ms，为了让单元格移动效果能够显示完
}

function moveDown() {
  for (var j = 0; j < 4; j++) {
    for (var i = 2; i >= 0; i--) {
      if (num_data[i][j] != 0) {
        for (var k = 3; k > i; k--) {
          if (num_data[k][j] == 0 && noBlockVertical(j, i, k, num_data)) {
            //第j列的第i-k行之间是否有障碍物
            showMoveAnimation(i, j, k, j);
            num_data[k][j] = num_data[i][j];
            num_data[i][j] = 0;
            break;
          } else if (
            num_data[k][j] == num_data[i][j] &&
            noBlockVertical(j, i, k, num_data)
          ) {
            showMoveAnimation(i, j, k, j);
            num_data[k][j] += num_data[i][j];
            num_data[i][j] = 0;
            score.value += num_data[k][j];

            break;
          }
        }
      }
    }
  }
  //更新页面上的数字单元格，此处才是真正的更新显示移动后的效果
  setTimeout(updateNumView, 200); //等待500ms，为了让单元格移动效果能够显示完
}

//向左移动
function canMoveLeft() {
  for (var i = 0; i < 4; i++) {
    for (var j = 1; j < 4; j++) {
      if (num_data[i][j] != 0) {
        if (num_data[i][j - 1] == 0 || num_data[i][j - 1] == num_data[i][j]) {
          return true;
        }
      }
    }
  }
  return false;
}
//向上移动
function canMoveUp() {
  for (var i = 1; i < 4; i++) {
    for (var j = 0; j < 4; j++) {
      if (num_data[i][j] != 0) {
        if (num_data[i - 1][j] == 0 || num_data[i - 1][j] == num_data[i][j]) {
          return true;
        }
      }
    }
  }
  return false;
}
//向右移动
function canMoveRight() {
  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 3; j++) {
      if (num_data[i][j] != 0) {
        if (num_data[i][j + 1] == 0 || num_data[i][j + 1] == num_data[i][j]) {
          return true;
        }
      }
    }
  }
  return false;
}
//向下移动
function canMoveDown() {
  for (var i = 0; i < 3; i++) {
    for (var j = 0; j < 4; j++) {
      if (num_data[i][j] != 0) {
        if (num_data[i + 1][j] == 0 || num_data[i + 1][j] == num_data[i][j]) {
          return true;
        }
      }
    }
  }
  return false;
}
//判断水平方向上是否没有障碍物
function noBlockHorizontal(row, col1, col2) {
  for (var i = col1 + 1; i < col2; i++) {
    if (num_data[row][i] != 0) {
      return false;
    }
  }
  return true;
}
//判断垂直方向上是否没有障碍物
function noBlockVertical(col, row1, row2) {
  for (var i = row1 + 1; i < row2; i++) {
    if (num_data[i][col] != 0) {
      return false;
    }
  }
  return true;
}

//通过动画显示移动的效果
function showMoveAnimation(fromx, fromy, tox, toy) {
  var numberCell = $('#grid_num_' + fromx + '_' + fromy);
  numberCell.animate(
    {
      top: getPosTop(tox, toy),
      left: getPosLeft(tox, toy),
    },
    200
  );
}

function nospace() {
  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 4; j++) {
      if (num_data[i][j] == 0) {
        return false;
      }
    }
  }
  return true;
}
function noMove() {
  if (canMoveLeft() || canMoveUp() || canMoveRight() || canMoveDown()) {
    return false;
  }
  return true;
}
function IsGameOver() {
  if (nospace() && noMove()) {
    gaming.value = false;
    $q.notify({
      message: '游戏结束',
      progress: true,
    });
  }
}
</script>
<style scoped>
:deep #grid_box {
  background-color: #bbada0;
  border-radius: 5px;
}
:deep .grid_cell {
  background-color: #ccc0b3;
  border-radius: 5px;
  position: absolute;
}
:deep .grid_num {
  border-radius: 5px;
  position: absolute;
  text-align: center;
  font: bold 50px Arial;
  line-height: v-bind(cell_width_ref);
}
</style>
