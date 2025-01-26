pipeline {
    agent any
    tools {
        nodejs "NodeJS16" 
    }
    stages {
        stage('Clone Repository') {
            steps {
                git 'git@github.com:GiharaNavindu/talks-dev.git'
            }
        }
        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }
        stage('Build Application') {
            steps {
                sh 'npm run build'
            }
        }
    }
    post {
        success {
            archiveArtifacts artifacts: 'build/**', fingerprint: true
        }
    }
}
