(function () {
  'use strict';

  var Issue = Backbone.Model.extend({
    defaults: {
      title: '',
      completed: false,
      description: ''
    },

    initialize: function (){
      console.log('This model has been initialized: ' + JSON.stringify(this)); // Log
    }
  }); //Extend BB model as Issue

   var IssuesCollection = Backbone.Collection.extend({
    model: Issue
  });

 

  var issuesList = new IssuesCollection([

      {
        title: 'issue #1',
        completed: true
      },

      {
        title: 'issue #2',
      }

    ]);

  //var projectsList = new ProjectsCollection([issuesList]);

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
      return {
        projects: [
                    {name: 'Home project'},
                    {name: 'Games'},
                    {name: 'Movies'},
                    {name: 'Study JavaScript'}
        ]
      }
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
    },

    issue_list: function () {
        $(".block").hide();
        $(".js-issue-list").show();
    },

    issue_detail: function () {
        $(".block").hide();
        $(".js-issue-detail").show();
    }
  });

  var controller = new Controller(); // Создаём контроллер

  Backbone.history.start();  // Запускаем HTML5 History push  

  $(function () {
    var mainView = new MainView({
      el: $('#application')
    });
    mainView.render();
  });

})();
