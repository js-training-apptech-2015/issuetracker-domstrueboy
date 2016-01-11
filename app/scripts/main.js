(function () {
  'use strict';

  var Issue = Backbone.Model.extend({
    defaults: {
      title: '',
      completed: false,
      description: '',
      project: 'unsorted'
    },

    initialize: function (){
      //console.log('This model has been initialized: ' + JSON.stringify(this)); // Log
    }
  });

   var IssuesCollection = Backbone.Collection.extend({
    model: Issue,

    initialize: function(){
      //console.log(JSON.stringify(this))
    }
  });

  var issuesList = new IssuesCollection([

      {
        title: 'issue #1',
        completed: true,
        project: 'Movies'

      },

      {
        title: 'issue #2',
        project: 'Games'
      },

      {
        title: 'issue #3',
        completed: true,
        project: 'Study JavaScript'
      },

      {
        title: 'issue #4',
        completed: true,
        project: 'Study JavaScript'
      },

      {
        title: 'issue #5'
      }

    ]);

  console.log("List size: " + issuesList.length);

  var TemplateView = Backbone.View.extend({
    render: function () {
      var template = templates[this.template];
      this.$el.html(template.render(this.getContext()));
    },
    getContext: function () {
      return this.model ? this.model.toJSON() : {};
    }
  });

  var MainView = TemplateView.extend({

    template: 'main',

    render: function () {
      TemplateView.prototype.render.call(this);
      this.projectListView = new ProjectListView({
        el: this.$('.js-project-list')
      });
      this.projectListView.render();

      this.routeListView = new RouteListView({
        el: this.$('.js-route-list')
      });
      this.routeListView.render();

      this.issueListView = new IssueListView({
        el: this.$('.js-issue-list')
      });
      this.issueListView.render();

      this.issueDetailView = new IssueDetailView({
        el: this.$('.js-issue-detail')
      });
      this.issueDetailView.render();
    }
  });


  var ProjectListView = TemplateView.extend({

    template: 'project-list',

    getContext: function () {

      var arr = issuesList.pluck('project');

      function uniqueVal(value, index, self) { 
        return self.indexOf(value) === index;
      }

      arr = arr.filter( uniqueVal );

      var project = [];

      for(var i = 0; i < arr.length; i++){
        project.push(
          { name: arr[i] }
        );
      }

      return {
        projects: project
      }
    },

    events: {
      "click": "open"
    },

    open: function () {
      console.log(this);
      //console.log(e.get("project") + " is clicked");
      //$(this.el).css("color", "red");
      //controller.navigate("issue_list", true); // переход на страницу issue_list
    }
  });

  var RouteListView = TemplateView.extend({
    template: 'route-list',
    getContext: function () {
      return {
        routes: [
                    {name: 'Home'},
                    {name: 'Next'}
        ]
      }
    }
  });

  var IssueListView = TemplateView.extend({
    template: 'issue-list',
    getContext: function () {
      return {
        issues: [
                    {name: 'Issue #1'},
                    {name: 'Issue #2'}
        ]
      }
    }
  });

  var IssueDetailView = TemplateView.extend({
    template: 'issue-detail',
    getContext: function () {
      return {
        issue: {name: 'Issue #1', description: "Blabla description about this issue"}
      }
    }
  });

  var Controller = Backbone.Router.extend({
    routes: {
        "": "project_list", // Пустой hash-тэг
        "project_list": "project_list", // Начальная страница
        "issue_list": "issue_list",
        "issue_detail": "issue_detail"
    },

    project_list: function () {
        $(".block").hide(); // Прячем все блоки
        $(".js-project-list").show(); // Показываем нужный
        console.log("project_list is executed");
    },

    issue_list: function () {
        $(".block").hide();
        $(".js-issue-list").show();
        console.log("issue_list is executed");
    },

    issue_detail: function () {
        $(".block").hide();
        $(".js-issue-detail").show();
        console.log("issue_detail is executed");
    }
  });

  var controller = new Controller(); // Создаём контроллер

  Backbone.history.start();  // Запускаем HTML5 History push

  $(function () {
    var mainView = new MainView({
      el: $('#application')
    });

    mainView.render();
    controller.project_list();

  });

})();
