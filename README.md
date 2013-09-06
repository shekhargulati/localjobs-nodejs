localjobs-nodejs
================

LocalJobs Application written using Node.js and MongoDb

To deploy on OpenShift just type following command.

```
$ rhc app create localjobs nodejs mongodb-2.2 --from-code=https://github.com/shekhargulati/localjobs-nodejs.git
```
After application is successfully created, go to http://localjobs-{domain-name}.rhcloud.com

