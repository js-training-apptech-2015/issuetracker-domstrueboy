(function () {
  'use strict';

  var ENTER_KEY = 13;

  var selectedProject = 'unsorted';
  var selectedIssue = 'issueissue';

  var Issue = Backbone.Model.extend({
    defaults: {
      title: 'noname',
      completed: false,
      description: 'none',
      project: 'unsorted'
    },

    initialize: function (){
      this.on('change', function(){
        console.log('"' + this.get("title") + '" model have changed.');
      });
      this.on('remove', function(){
        console.log('"' + this.get("title") + '" model have removed.');
      });
    }
  });

   var IssuesCollection = Backbone.Collection.extend({
    model: Issue,

    initialize: function(){
      //console.log(JSON.stringify(this.models));
    }
  });

  var issuesList = new IssuesCollection([

      {
        title: "Editing issue`s props-fields",
        project: "Our Issue Tracker",
        description: "Need for add",
        completed: false
      },

      {
        title: "Adding and deleting projects",
        project: "Our Issue Tracker",
        description: "Need for add",
        completed: false
      },

      {
        title: "Editing project`s title",
        project: "Our Issue Tracker",
        description: "To add or not to add?",
        completed: false
      },

      {
        title: "Highlight new issue during a second",
        project: "Our Issue Tracker",
        description: "To add or not to add?",
        completed: false
      },

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
      var qt = []; //quantity

      for(var i = 0; i < arr.length; i++){
        project.push(
          { 
            name: arr[i],
            qt: issuesList.where({project: arr[i]}).length
          }
        );
      }

      return {
        routes: [
          {route: '<span class="Home-link">Projects</span>'}
        ],

        projects: project
      }
    },

    events: {
      "click .project": "open",
      "click .Home-link": "goHome"
    },

    open: function (e) {

      selectedProject = e.currentTarget.lastElementChild.innerText;

      Backbone.trigger('refresh-IssueListView');
      controller.navigate("issue_list/" + selectedProject, true); // переход на страницу issue_list
    },

    initialize: function() {
        this.listenTo(Backbone, 'refresh-ProjectListView', this.refreshProjectListView);
    },

    refreshProjectListView: function() {
      this.render();
    },

    goHome: function() {
      controller.navigate("project_list", true);
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
          {route: '<span class="Home-link">Projects</span>'},
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
      "keypress #newIssue-input-title": "newIssueOnEnter",
      "click .collapseNewIssue-button": "collapse",
      "click .Home-link": "goHome"
    },

    open: function (e) {
      selectedIssue = e.target.innerText;

      Backbone.trigger('refresh-IssueDetailView');
      controller.navigate("issue_detail/" + selectedIssue, true); // переход на страницу issue_detail
    },

    newIssueOnEnter: function(e) {
      if ( e.which === ENTER_KEY ) {
         this.newIssue();
      }
    },

    newIssue: function(){

      selectedIssue = $("#newIssue-input-title").val();
      var descr = $("#newIssue-input-description").val();

      if(selectedIssue === ""){
        selectedIssue = "noname";
      }

      if(descr === ""){
        descr = "none";
      }

      issuesList.add(
        {
          title: selectedIssue,
          project: selectedProject,
          description: descr,
          completed: $("#newIssue-input-completed").val()
        }
      );

      Backbone.trigger('refresh-IssueDetailView');
      Backbone.trigger('refresh-ProjectListView');
      Backbone.trigger('refresh-IssueListView');
      
      controller.navigate("issue_detail/" + selectedIssue, true);
    },

    issueDelete: function() {
      issuesList.remove(issuesList.findWhere({title: selectedIssue}));
      Backbone.trigger('refresh-IssueListView');
      Backbone.trigger('refresh-ProjectListView');
      controller.navigate("issue_list/" + selectedProject, true);
    },

    collapse: function() {
      $("#collapseNewIssue-block").toggleClass("collapse");
    },

    goHome: function() {
      controller.navigate("project_list", true);
    }
  });

  var IssueDetailView = TemplateView.extend({
    template: 'issue-detail',
    getContext: function () {
      var currentIssue = issuesList.findWhere({title: selectedIssue});

      function checkedOrUnchecked(){
        if(currentIssue.get('completed')){
          return 'checked';
        } else {
          return '';
        }
      }

      return {
        routes: [
          {route: '<span class="Home-link">Projects</span>'},
          {route: selectedProject},
          {route: '<span class="IssuesList-link">Issues</span>'},
          {route: selectedIssue}
        ],

        issue: {
          title: currentIssue.get('title'),
          description: currentIssue.get('description'),
          project: currentIssue.get('project'),
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
      "click #issueShake-button" : "issueShake",
      "click .Home-link": "goHome",
      "click .IssuesList-link": "goToIssuesList",
      "click .issueEdit-button-editState": "editItem",
      "click .issueEdit-button-saveState": "saveItem",
      "dblclick .detailView-input": "editItem"
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
    },

    goHome: function() {
      controller.navigate("project_list", true);
    },

    goToIssuesList: function() {
      controller.navigate("issue_list", true);
    },

    editItem: function() {
      $(".detailView-input").removeAttr("disabled");
      $("#issueEdit-button").text("Save").toggleClass("btn-warning")
                                          .toggleClass("btn-primary")
                                          .removeClass("issueEdit-button-editState")
                                          .addClass("issueEdit-button-saveState");
    },

    saveItem: function() {

      var currentModel = issuesList.findWhere({title: selectedIssue});

      selectedIssue = $("#detailView-title").val()

      currentModel.set({
        title: selectedIssue,
        description: $("#detailView-description").val(),
        completed: $("#detailView-completed").val()
      });

      $(".detailView-input").attr("disabled", "disabled");
      $("#issueEdit-button").text("Edit").toggleClass("btn-warning")
                                          .toggleClass("btn-primary")
                                          .removeClass("issueEdit-button-saveState")
                                          .addClass("issueEdit-button-editState");

      Backbone.trigger('refresh-IssueDetailView');
      //Backbone.trigger('refresh-ProjectListView');
      Backbone.trigger('refresh-IssueListView');

      //controller.navigate("issue_detail/" + selectedIssue, true);
    }
  });

  var Controller = Backbone.Router.extend({
    routes: {
        "(/)": "project_list", // Пустой hash-тэг
        "project_list": "project_list", // Начальная страница
        "issue_list(/:project)": "issue_list",
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

  Backbone.history.start({pushState: true});/*, root: '/project_list/'*/ /*,hashChange: false*///hashChange: false});  // Запускаем HTML5 History push

  $(function () {
    var mainView = new MainView({
      el: $('#application')
    });

    mainView.render();
    controller.project_list();

  });

})();
