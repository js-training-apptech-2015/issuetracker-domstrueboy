(function () {
  'use strict';

  var ENTER_KEY = 13;

  var selectedProject = 'unsorted';
  var selectedIssue = 'issueissue';

  var Issue = Backbone.Model.extend({
    defaults: {
      title: '',
      completed: false,
      description: 'none',
      project: 'unsorted'
    },

    initialize: function (){
      console.log(this.get('title') + " added");
      this.on('change', function(){
        console.log('- Values for this model have changed.');
      });
      this.on('remove', function(){
        console.log('- Values for this model have removed.');
      });
    }
  });

   var IssuesCollection = Backbone.Collection.extend({
    model: Issue,

    initialize: function(){
      console.log(JSON.stringify(this.models));
    }
  });

  var issuesList = new IssuesCollection([

      {
        title: 'Le Petit Prince',
        completed: true,
        description: 'About little prince and another',
        project: 'Movies'
      },

      {
        title: 'Coriolan',
        completed: true,
        description: 'Basis on Sheakspeare`s tragedy',
        project: 'Movies'
      },

      {
        title: 'Postal',
        completed: false,
        description: 'Bullshit',
        project: 'Games'
      },

      {
        title: 'Heroes of Might and Magic 3',
        completed: true,
        description: 'Classic game',
        project: 'Games'
      },

      {
        title: 'Test Fix',
        completed: true,
        description: 'Test description',
        project: 'Study JavaScript'
      },

      {
        title: 'Windows external error',
        completed: false,
        description: 'Very very important fix',
        project: 'Study JavaScript'
      },

      {
        title: 'issueissue'
      },

      {
        title: 'issueissueissue'
      }

    ]);

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
        routes: [
          {route: '<a href="#/project_list">Home</a>'}
        ],

        projects: project
      }
    },

    events: {
      "click .project": "open"
    },

    open: function (e) {
      selectedProject = e.target.innerText;
      console.log('Project "' + selectedProject + '" is clicked');
      Backbone.trigger('refresh-IssueListView');
      controller.navigate("issue_list/" + selectedProject, true); // переход на страницу issue_list
    }
  });

  var IssueListView = TemplateView.extend({
    template: 'issue-list',
    getContext: function () {
      var arr = issuesList.where({project: selectedProject});
      for(var i = 0; i < arr.length; i++){
        arr[i] = arr[i].pick('title');
      }
      return {
        routes: [
          {route: '<a href="#/project_list">Home</a>'},
          {route: selectedProject}
        ],

        issues: arr
      }
    },

    initialize: function() {
        this.listenTo(Backbone, 'refresh-IssueListView', this.refreshIssueListView);
        this.listenTo(Backbone, 'issueDelete', this.issueDelete);
    },

    refreshIssueListView: function() {
        this.render();
    },

    events: {
      "click .issue": "open",
      "click #newIssue-button": "newIssue",
      "keypress #newIssue-input": "newIssueOnEnter"
    },

    open: function (e) {
      selectedIssue = e.target.innerText;
      console.log('Issue "' + selectedIssue + '" is clicked');
      Backbone.trigger('refresh-IssueDetailView');
      controller.navigate("issue_detail/" + selectedIssue, true); // переход на страницу issue_detail
    },

    newIssueOnEnter: function(e) {
      if ( e.which === ENTER_KEY ) {
         this.newIssue();
      }
    },

    newIssue: function(){
      issuesList.add({
        title: $("#newIssue-input").val(),
        project: selectedProject
      });
      Backbone.trigger('refresh-IssueListView');
      //controller.navigate("issue_list/" + selectedProject, true);
    },

    issueDelete: function() {
      issuesList.remove(issuesList.findWhere({title: selectedIssue}));
      Backbone.trigger('refresh-IssueListView');
      controller.navigate("issue_list/" + selectedProject, true);
    }
  });

  var IssueDetailView = TemplateView.extend({
    template: 'issue-detail',
    getContext: function () {
      var findedIssue = issuesList.findWhere({title: selectedIssue});

      function checkedOrUnchecked(){
        if(findedIssue.get('completed')){
          return 'checked';
        } else {
          return '';
        }
      }

      return {
        routes: [
          {route: '<a href="#/project_list">Home</a>'},
          {route: selectedProject},
          {route: '<a href="#/issue_list">IssueList</a>'},
          {route: selectedIssue}
        ],

        issue: {
          title: findedIssue.get('title'),
          description: findedIssue.get('description'),
          project: findedIssue.get('project'),
          completed: checkedOrUnchecked()
        }
      }
    },

    initialize: function() {
        this.listenTo(Backbone, 'refresh-IssueDetailView', this.refreshIssueDetailView);
    },

    refreshIssueDetailView: function() {
        this.render();
    },

    events: {
      "click #issueDelete-button": "issueDelete",
      "click #issueShake-button" : "issueShake"
    },

    issueDelete: function() {
      Backbone.trigger('issueDelete');
    },

    issueShake: function() {
        $("#issue-table").animate({'margin-left': '25px'}, 50,
          function(){
            $("#issue-table").animate({'margin-left': '0px'}, 50,
              function(){
                $("#issue-table").animate({'margin-left': '25px'}, 50,
                  function(){
                     $("#issue-table").animate({'margin-left': '0px'}, 50)
                  }
                );
              }
            );
          }
        );
    }
  });

  var Controller = Backbone.Router.extend({
    routes: {
        "": "project_list", // Пустой hash-тэг
        "project_list": "project_list", // Начальная страница
        "issue_list": "issue_list",
        "issue_list/:project": "issue_list",
        "issue_detail/:issue": "issue_detail"
    },

    project_list: function () {
        $(".block").hide(); // Прячем все блоки
        $(".js-project-list").show(); // Показываем нужный
    },

    issue_list: function (project) {
        $(".block").hide();
        $(".js-issue-list").show();
    },

    issue_detail: function (issue) {
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
    controller.project_list();

  });

})();
