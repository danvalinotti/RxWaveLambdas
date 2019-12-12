**Lambda Functions**

**Developing Locally**

In your command prompt, type:
  
  **1.** _git clone_ [_https://github.com/danvalinotti/RxWaveLambdas.git_](https://github.com/danvalinotti/RxWaveLambdas.git)
  
  **2.** _cd RxWaveLambdas_
  
  **3.** _npm install_

  _In your code editor:_
    
  **i.** Comment any import statements directly under &quot;PRODUCTION IMPORTS&quot;
    
  **ii.** _Un_-comment any import statements directly under &quot;DEV IMPORTS&quot;
    
  **iii.** _Un_-comment the line containing &quot;module.exports = handler;&quot; at the bottom of the file.
    
  **iv.** NOTE: when deploying these scripts to Production, the above process must be reversed.

**Testing**

**1.** Using npm scripts
  
    npm star_ runs the index.js file which can be configured to run whatever lambda scripts are not commented out.

**2.** Using the _node_ command
  
    node filename.js will run an individual script.

**Deploying to Production**

**3.** Uncomment any production import statements and comment any  line containing &quot;module.exports = handler;&quot;

**4.** Copy script text and paste into AWS Lambda code editor window

**5.** Click &quot;Save&quot; at the top of the screen
