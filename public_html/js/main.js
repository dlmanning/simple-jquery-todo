$(function () { // on ready!

  var app = {};
  var todos = [];
  app.todos = todos;

  $.getJSON('/api/todos', function (data) {
    data.forEach(function (item) {
      var todo = new Todo(item.description, item.done);
      todo.id = item.id;
      todos.push(todo);
    });
  }).always(whenTodosAreLoaded);

  function whenTodosAreLoaded () {
    renderTodos(todos);

    $('#clear-completed').click(function () {
      todos.forEach(function (todo) {
        if (todo.done === true) {
          $.ajax('/api/todos/' + todo.id, {
            type: 'DELETE',
          });
        }
      });
    });

    $('#add-new-todo').click(function () {
      var $newTodo = $('#new-todo');
      var newTodo = {};
      newTodo.description = $newTodo.val();
      newTodo.done = false;

      $newTodo.val('');

      if (newTodo) {
        $.post('/api/todos/add', JSON.stringify(newTodo), function (data) {
          console.log(data);
          var todo = new Todo(data.description, data.done);
          todo.id = data.id;
          todos.push(todo);

          renderTodos(todos);
        });
      }
    });
  }

  window.app = app;

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

function Todo (description, done, onUpdate) {
  this.description = description || "Get the milk";
  this.done = done || false;
}

Todo.prototype.modelUpdated = function () {
  var self = this;
  $.post('/api/todos/' + this.id, JSON.stringify(this));
};

Todo.prototype.toggleDone = function () {
  this.done = !this.done;
  this.modelUpdated();
};
