pipeline {
    agent {
        label 'node1'
    }

    stages {
        stage('Build') {
            steps {
                echo 'Building..'
                echo "install dependencies"
                sh 'npm install'
                echo 'create build'
                sh 'npm run build'
            }
        }
        stage('Test') {
            steps {
                echo 'Testing..'
            }
        }
        stage('Deploy') {
            steps {
                echo 'Deploying....'

            }
        }
    }
}