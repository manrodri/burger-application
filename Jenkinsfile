pipeline {
    agent none


    stages {
        stage('Build front-end') {
            agent {
        label 'node1'
    }
            steps {
                echo 'Building..'
                echo "install dependencies"
                sh 'npm install'
                echo 'create build'
                sh 'npm run build'
            }
        }

        stage('Build back-end') {
            agent {
        label 'node2'
    }
            steps {
                echo 'Building..'
                echo "install dependencies"
                sh 'npm install'
                echo 'create build'
                sh 'npm run build'
            }
        }
        stage('Test') {
            agent any
            steps {
                echo 'Testing..'
            }
        }
        stage('Deploy') {
            agent {
        label 'node1'
    }
            steps {
                echo 'Deploying....'
                sh 'aws s3 cp --recursive build s3://react-burger-app-dev'
            }
        }
    }
}