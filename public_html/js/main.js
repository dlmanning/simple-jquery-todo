$(function () { // on ready!

  var todos = [];

  $.getJSON('/api/data', function (data) {
    data.forEach(function (item) {
      todos.push(new Todo(item.description, post, item.done));
    });
    whenTodosAreLoaded();
  });

  function whenTodosAreLoaded () {
    renderTodos(todos);

    $('#clear-completed').click(function () {
      var remainingTodos = [];
      todos.forEach(function (todo) {
        if (todo.done === false) {
          remainingTodos.push(todo);
        }
      });

      todos = remainingTodos;
      post();
    });

    $('#add-new-todo').click(function () {
      var $newTodo = $('#new-todo');
      var newTodo = $newTodo.val();
      if (newTodo) {
        todos.push(new Todo(newTodo, post));
        $newTodo.val('');
        post();
      }
    });
  }

  function post () {
    $.post('/api/data', JSON.stringify(todos), function (data) {
      var returnedTodos = [];
      data.forEach(function (item) {
        returnedTodos.push(new Todo(item.description, post, item.done));
      });
      todos = returnedTodos;
      renderTodos(todos);
    });
  }

});

function renderTodos (todos) {
  $content = $('<div></div').addClass('list-group');

  todos.forEach(function (todo) {
    var todoGlyph = todo.done ? 'glyphicon-ok' : 'glyphicon-remove';

    var $todoNode = $('<span> ' + todo.description + '</span>').addClass('list-group-item lead');
    var $todoButton = $('<button></button>').addClass('btn btn-default btn-lg');
    var $todoIcon = $('<span></span>').addClass('glyphicon ' + todoGlyph);

    $todoButton.click(toggleTodo);

    $content.append($todoNode.prepend($todoButton.append($todoIcon)));

    function toggleTodo () {
      todo.toggleDone();
      if (todo.done) {
        $todoIcon.removeClass('glyphicon-remove').addClass('glyphicon-ok');
      } else {
        $todoIcon.removeClass('glyphicon-ok').addClass('glyphicon-remove');
      }
    }

  });

  $('#todobox').html($content);

}

function Todo (description, onUpdate, done) {
  this.description = description || "Get the milk";
  this.modelUpdated = onUpdate || function () {};
  this.done = done || false;
}

Todo.prototype.toggleDone = function () {
  this.done = !this.done;
  this.modelUpdated();
}
