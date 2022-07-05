# Django Docker WhatsApp

A Web based App with instructions on deploying to Heroku docker. 

Also includes deployment using asgi instead og wsgi using daphne

## Steps 

1. Create App in Heroku and provision all resources, Postgres and Redis.
    - URI will be automatically generated and added to Heroku Config Vars
    - Will need to add secret key and other passwords if any

2. Login into heroku

    ``` heroku login -i ```

3. Login into heroku container

    ``` heroku container:login ```

    reply: ``` Login Successful ```

4. Make image and push container to Heroku

    ``` heroku container:push web --app django-docker-whatsapp ```

    This will run the Dockerfile with all commands

5. Release Container 

    ``` heroku container:release web --app django-docker-whatsapp ```

