pipeline {
    agent any

    environment {
        DOCKER_USERNAME = 'devgixa'
        DOCKER_IMAGE_FRONTEND = 'devgixa/frontend-service'
        DOCKER_IMAGE_BACKEND = 'devgixa/backend-service'
        DOCKER_IMAGE_DATABASE = 'devgixa/mongo-service'
        BUILD_TAG = "latest"  // Using 'latest' for better readability
    }

    stages {
        stage('SCM Checkout') {
            steps {
                retry(3) {
                    git branch: 'main', url: 'https://github.com/GiharaNavindu/talks-dev.git'
                }
            }
        }

        stage('Build Frontend Image') {
            steps {
                script {
                    bat "docker build -t ${DOCKER_IMAGE_FRONTEND}:${BUILD_TAG} ./client"
                }
            }
        }

        stage('Build Backend Image') {
            steps {
                script {
                    bat "docker build -t ${DOCKER_IMAGE_BACKEND}:${BUILD_TAG} ./api"
                }
            }
        }
        
        stage('Build Database Image') {
            steps {
                script {
                    bat "docker pull mongo:6.0"
                    bat "docker tag mongo:6.0 ${DOCKER_IMAGE_DATABASE}:${BUILD_TAG}"
                }
            }
        }

        stage('Run Locally for Testing') {
            steps {
                script {
                    echo "Stopping and removing existing containers..."
                    bat """
                        docker stop frontend-container 2>nul || exit /b 0
                        docker stop backend-container 2>nul || exit /b 0
                        docker stop mongo-container 2>nul || exit /b 0
                        docker rm frontend-container 2>nul || exit /b 0
                        docker rm backend-container 2>nul || exit /b 0
                        docker rm mongo-container 2>nul || exit /b 0
                        """


                    echo "Running new containers..."
                    bat """
                        docker network create app-network || true

                        docker run -d --name mongo-container --network app-network ${DOCKER_IMAGE_DATABASE}:${BUILD_TAG}

                        docker run -d --name backend-container --network app-network \
                            -e MONGO_URI=mongodb://mongo-container:27017/mydb \
                            -p 8080:8080 ${DOCKER_IMAGE_BACKEND}:${BUILD_TAG}

                        docker run -d --name frontend-container --network app-network \
                            -p 3000:3000 ${DOCKER_IMAGE_FRONTEND}:${BUILD_TAG}
                    """

                    echo "Containers are running. Use 'docker ps' to check the status."
                }
            }
        }

        stage('Login to Docker Hub') {
            steps {
                script {
                    withCredentials([string(credentialsId: 'Dockerpwd', variable: 'DOCKER_PASSWORD')]) {
                        def loginResult = bat(script: "docker login -u ${DOCKER_USERNAME} -p ${DOCKER_PASSWORD}", returnStatus: true)
                        if (loginResult != 0) {
                            error "Docker login failed!"
                        } else {
                            echo "Successfully logged in to Docker Hub."
                        }
                    }
                }
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                script {
                    bat "docker push ${DOCKER_IMAGE_FRONTEND}:${BUILD_TAG}"
                    bat "docker push ${DOCKER_IMAGE_BACKEND}:${BUILD_TAG}"
                    bat "docker push ${DOCKER_IMAGE_DATABASE}:${BUILD_TAG}"
                }
            }
        }
    }

    post {
        always {
            bat 'docker logout'
            echo "Logged out from Docker Hub."
        }
    }
}
