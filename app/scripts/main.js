(function () {
  'use strict';

  var ENTER_KEY = 13;

  var selectedProject = 'unsorted';
  var selectedIssue = 'noname';
  var selectedIssueID = '';

  var Issue = Backbone.Model.extend({

    defaults: {
      title: 'noname',
      completed: false,
      description: 'none',
      project: 'unsorted'
    },

    sync: function (method, model, options) { //переопределение стандартного метода sync
      /*if (method === 'create') { //create → POST   (/collection - стандартный путь)
        console.log('arguments: ' + JSON.stringify(arguments["2"]));
      }*/
      if (method === 'read') { //read → GET   (/collection[/id] - стандартный путь)
        arguments["2"].url = '/issue_detail/' + model.id;
        //selectedIssue = model.title;
        console.log('arguments: ' + JSON.stringify(arguments["2"]));
      }else if (method === 'update') { //update → PUT   (/collection/id - стандартный путь)
        arguments["2"].url = '/issue_detail/' + model.id;
        console.log('arguments: ' + JSON.stringify(arguments["2"]));
      }else if (method === 'delete') { //delete → DELETE   (/collection/id - стандартный путь)
        arguments["2"].url = '/issue_detail/' + model.id;
        console.log('arguments: ' + JSON.stringify(arguments["2"]));
      }
      return Backbone.sync.apply(this, arguments);
    },

    initialize: function (){

      this.on('change', function(){
        console.log('"' + this.get("title") + '" model have changed.');
      });
      this.on('remove', function(){
        console.log('"' + this.get("title") + '" model have removed.');
      });
      this.on('sync', function  () {
        console.log("sync!");

        Backbone.trigger('refresh-IssueDetailView');
        Backbone.trigger('refresh-ProjectListView');
        Backbone.trigger('refresh-IssueListView');
      });
    },

    parse: function(response) {
      response.id = response._id;
      return response;
    }
  });

   var IssuesCollection = Backbone.Collection.extend({
    model: Issue,
    url: '/issue_list',

    initialize: function(){
      $(".block").hide();
      $(".please_wait").show();
      this.fetch({reset: true, success: function(){controller.project_list()}});
    }
  });

  var issuesList = new IssuesCollection();

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
        this.listenTo(issuesList, 'reset', this.refreshProjectListView);
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
        this.listenTo(issuesList, 'reset', this.refreshIssueListView);
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

      issuesList.findWhere({title: selectedIssue}).fetch({success: function(model, response) {
          Backbone.trigger('refresh-IssueListView');
          Backbone.trigger('refresh-ProjectListView');
          controller.navigate("issue_detail/" + model.id, true);
      }});
    },

    newIssueOnEnter: function(e) {
      if ( e.which === ENTER_KEY ) {
         this.newIssue();
      }
    },

    newIssue: function(e){

      var newModel = issuesList.create(
        {
          title: $("#newIssue-input-title").val(),
          project: selectedProject,
          description: $("#newIssue-input-description").val(),
          completed: $("#newIssue-input-completed").val()
        },
        {wait: true} //model not created until server don`t responsed
      );

      controller.navigate("issue_list/" + newModel.id, true);
    },

    issueDelete: function() {
      issuesList.findWhere({title: selectedIssue}).destroy({success: function(model, response) {
          console.log(model.title + ' deleted!');
          Backbone.trigger('refresh-IssueListView');
          Backbone.trigger('refresh-ProjectListView');
          controller.navigate("issue_list/" + model.project, true);
      }}, {wait: true});

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
      controller.navigate("issue_list/" + selectedProject, true);
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

      currentModel.save({
        title: selectedIssue,
        description: $("#detailView-description").val(),
        completed: $("#detailView-completed").val()
      }, {wait: true});

      $(".detailView-input").attr("disabled", "disabled");
      $("#issueEdit-button").text("Edit").toggleClass("btn-warning")
                                          .toggleClass("btn-primary")
                                          .removeClass("issueEdit-button-saveState")
                                          .addClass("issueEdit-button-editState");

      Backbone.trigger('refresh-IssueDetailView');
      Backbone.trigger('refresh-IssueListView');
    }
  });

  var Controller = Backbone.Router.extend({
    routes: {
        "(/)": "project_list", // Пустой hash-тэг
        "project_list": "project_list", // Начальная страница
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

  Backbone.history.start({pushState: true});// Запускаем HTML5 History push

  $(function () {
    var mainView = new MainView({
      el: $('#application')
    });

    mainView.render();

  });

})();
