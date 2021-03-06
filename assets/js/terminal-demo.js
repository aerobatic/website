$(function() {
  var TYPE_DELAY = 40;
  var COMMAND_DELAY = 1000; // amount of time to pause between commands
  var STEP_DELAY = 1000; // amount of time to show the spinner between step messages

  var terminalInput = $("#terminal-demo .input");
  var terminalOutput = $("#terminal-demo .output");
  var terminalSpinner = $("#terminal-demo .spinner");
  var timeoutIds = {};
  var runningDemo;

  var aeroDeployOutput = [
    "Compressing website assets",
    "Uploading source archive",
    "Waiting for cloud deployment to begin",
    "Cloud deployment in-progress"
  ];

  var aeroCreateOutput = "Creating new Aerobatic website in this directory";

  function aeroCreateSuccess(url) {
    return "Website " + url + " created";
  }

  function aeroDeploySuccess(url) {
    return "Version v1 deployment complete\nView it now at " + url;
  }

  var generatorDemos = {
    html: {
      title: "plain html",
      commands: [
        {
          text: "echo '<html>Aerobatic is easy!</html>' > index.html"
        },
        {
          text: "aero create",
          output: [aeroCreateOutput],
          success: aeroCreateSuccess("https://basic-html.aerobaticapp.com")
        },
        {
          text: "aero deploy",
          output: aeroDeployOutput,
          success: aeroDeploySuccess("https://html-demo.aerobaticapp.com")
        }
      ]
    },
    jekyll: {
      title: "Jekyll",
      commands: [
        {
          text: "jekyll new jekyll-demo",
          output: ["Creating new Jekyll site", "Running bundle install"],
          success: "New jekyll site created"
        },
        {
          text: "cd jekyll-demo"
        },
        {
          text: "aero create",
          output: [aeroCreateOutput],
          success: aeroCreateSuccess("https://jekyll-demo.aerobaticapp.com")
        },
        {
          text: "jekyll build",
          output: ["Building jekyll site"],
          success: "Done building site"
        },
        {
          text: "aero deploy --directory _site",
          output: aeroDeployOutput,
          success: aeroDeploySuccess("https://jekyll-demo.aerobaticapp.com")
        }
      ]
    },
    hugo: {
      title: "Hugo",
      commands: [
        {
          text: "hugo new site hugo-site",
          output: ["Creating hugo site"],
          success: "Hugo site created"
        },
        {
          text: "cd hugo-site"
        },
        {
          text:
            "(cd themes; git clone https://github.com/saey55/hugo-elate-theme)",
          output: ["Cloning hugo theme"],
          success: "Theme cloned"
        },
        {
          text: "aero create",
          output: [aeroCreateOutput],
          success: aeroCreateSuccess("https://hugo-demo.aerobaticapp.com")
        },
        {
          text: "hugo",
          output: ["Building hugo site"],
          success: "Done building site"
        },
        {
          text: "aero deploy --directory public",
          output: aeroDeployOutput,
          success: aeroDeploySuccess("https://hugo-demo.aerobaticapp.com")
        }
      ]
    },
    hexo: {
      title: "Hexo",
      commands: [
        {
          text: "hexo init new-hexo-site"
        },
        {
          text: "cd new-hexo-site"
        },
        {
          text: "npm install",
          output: ["Installing npm modules"],
          success: "Done with npm install"
        },
        {
          text: "aero create",
          output: [aeroCreateOutput],
          success: aeroCreateSuccess("https://hexo-demo.aerobaticapp.com")
        },
        {
          text: "hexo generate",
          output: ["Generating hexo site"],
          success: "Done generating site"
        },
        {
          text: "aero deploy --directory public",
          output: aeroDeployOutput,
          success: aeroDeploySuccess("https://hexo-demo.aerobaticapp.com")
        }
      ]
    },
    gatsby: {
      title: "Gatsby",
      commands: [
        {
          text: "gatsby new gatsby-project",
          output: ["Creating new site", "Installing packages"],
          success: "Gatsby done creating starter site"
        },
        {
          text: "cd gatsby-project"
        },
        {
          text: "aero create --name gatsby-demo",
          output: [aeroCreateOutput],
          success: "Website https://gatsby-demo.aerobaticapp.com created"
        },
        {
          text: "gatsby build",
          output: [
            "Building CSS",
            "Building production JavaScript bundles",
            "Building static HTML for pages"
          ],
          success: "Done building"
        },
        {
          text: "aero deploy --directory public",
          output: aeroDeployOutput,
          success: aeroDeploySuccess("https://gatsby-demo.aerobaticapp.com")
        }
      ]
    },
    react: {
      title: "React",
      commands: [
        {
          text: "create-react-app demo-react-app",
          output: [
            "Creating a new React app",
            "Installing packages",
            "Installing react-scripts"
          ],
          success: "Success! Created demo-react-app"
        },
        {
          text: "cd demo-react-app"
        },
        {
          text: "aero create",
          output: [aeroCreateOutput],
          success: "Website https://react-demo.aerobaticapp.com created"
        },
        {
          text: "yarn build",
          output: ["Creating an optimized production build"],
          success: "Successfully compiled app"
        },
        {
          text: "aero deploy --directory build",
          output: aeroDeployOutput,
          success: aeroDeploySuccess("https://react-demo.aerobaticapp.com")
        }
      ]
    }
  };

  $("#generatorMenu a").on("click", function(event) {
    event.preventDefault();
    if (runningDemo) return false;
    var key = $(this)
      .attr("href")
      .substr(1);
    $(this)
      .closest("ul")
      .find("li")
      .removeClass("active");
    $(this)
      .parent()
      .addClass("active");
    $(this)
      .closest("ul")
      .find("li:not(.active)")
      .addClass("inactive");

    loadGeneratorDemo(key);
  });

  function loadGeneratorDemo(generator) {
    console.log("load generator demo %s", generator);

    runningDemo = generator;

    $("#terminal-demo .learn-more")
      .css("display", "block")
      .attr("href", "/docs/static-site-generators/#" + generator)
      .text(
        "Learn more about " +
          generatorDemos[generator].title +
          " and Aerobatic >"
      );

    var generatorMenu = $("#generatorMenu");

    // Show a running indicator next to the generator
    generatorMenu
      .addClass("running")
      .find("li.active a")
      .append('<i class="fa fa-circle-o-notch fa-spin" />');

    // Clear all the timeouts
    $.each(Object.keys(timeoutIds), function(key) {
      clearTimeout(timeoutIds[key]);
    });
    timeoutIds = {};

    var generatorInfo = generatorDemos[generator];
    function repeat(index) {
      runDemoCommand(generatorInfo.commands[index], function() {
        if (index === generatorInfo.commands.length - 1) {
          // If this is the last command, exit.
          runningDemo = null;
          // Remove the spinner
          generatorMenu.find("li").removeClass("inactive");
          generatorMenu
            .removeClass("running")
            .find("li i.fa-spin")
            .remove();
          return;
        } else {
          repeat(index + 1);
        }
      });
    }

    repeat(0);
  }

  function runDemoCommand(commandInfo, done) {
    // When a command is typed display the corresponding output
    terminalInput.html("");
    terminalOutput.html("");
    terminalSpinner.hide();

    autotypeInput(commandInfo.text, function() {
      if (commandInfo.output) {
        writeCommandOutput(commandInfo, function() {
          delay(done, COMMAND_DELAY);
        });
      } else {
        delay(done, 300);
      }
    });
  }

  function autotypeInput(commandText, done) {
    var repeat = function(index) {
      terminalInput.append(commandText[index]);
      delay(function() {
        if (index < commandText.length - 1) {
          repeat(index + 1);
        } else {
          done();
        }
      }, TYPE_DELAY);
    };

    repeat(0);
  }

  function createDelay(ms) {
    return function(done) {
      delay(done, ms);
    };
  }

  function delay(func, ms) {
    var timeoutId = setTimeout(function() {
      delete timeoutIds[timeoutId];
      func();
    }, ms);
    timeoutIds[timeoutId] = timeoutId;
  }

  function writeCommandOutput(commandInfo, done) {
    terminalSpinner.show();

    var timeoutId;
    var append = function(index) {
      terminalOutput.append("\n> " + commandInfo.output[index]);
      // Delay 1s between outputs
      delay(function() {
        if (index < commandInfo.output.length - 1) {
          append(index + 1);
        } else {
          terminalSpinner.hide();
          // Show the success message
          terminalOutput.append("\n\n" + commandInfo.success);
          done();
        }
      }, STEP_DELAY);
    };

    append(0);
  }

  autotypeInput(
    "Try clicking one of the items below to see how it works!",
    function() {}
  );
});
