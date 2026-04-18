pipeline {
    agent any

    environment {
        NODE_ENV       = 'test'
        APP_BASE_URL   = 'http://localhost:4173'
        HEADLESS       = 'true'
        NODE_OPTIONS   = '--max-old-space-size=4096'
    }

    tools {
        nodejs 'NodeJS'
    }

    options {
        timeout(time: 45, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
        timestamps()
    }

    stages {

        // ─────────────────────────────
        // 1. CHECKOUT
        // ─────────────────────────────
        stage('Checkout') {
            steps {
                checkout scm
                echo "Branch: ${env.BRANCH_NAME}"
                echo "Commit: ${env.GIT_COMMIT?.take(8)}"
            }
        }

        // ─────────────────────────────
        // 2. INSTALL
        // ─────────────────────────────
        stage('Install') {
            steps {
                sh 'node --version'
                sh 'npm --version'
                sh 'npm ci --prefer-offline'
            }
        }

        // ─────────────────────────────
        // 3. LINT
        // ─────────────────────────────
        stage('Lint') {
            steps {
                sh 'npm run lint -- --format json --output-file eslint-report.json || true'
                sh 'npm run lint'
            }
            post {
                always {
                    archiveArtifacts artifacts: 'eslint-report.json', allowEmptyArchive: true
                }
            }
        }

        // ─────────────────────────────
        // 4. BUILD
        // ─────────────────────────────
        stage('Build') {
            steps {
                withCredentials([
                    string(credentialsId: 'SUPABASE_URL', variable: 'VITE_SUPABASE_URL'),
                    string(credentialsId: 'SUPABASE_ANON_KEY', variable: 'VITE_SUPABASE_ANON_KEY')
                ]) {
                    sh 'npm run build'
                }
            }
            post {
                success {
                    archiveArtifacts artifacts: 'dist/**', fingerprint: true
                }
            }
        }

        // ─────────────────────────────
        // 5. UNIT TESTS
        // ─────────────────────────────
        stage('Unit Tests') {
            steps {
                sh '''
                    mkdir -p reports
                    npm run test:unit -- --reporter=junit --outputFile=reports/unit-tests.xml
                '''
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: 'reports/unit-tests.xml'
                }
            }
        }

        // ─────────────────────────────
        // 6. INTEGRATION TESTS
        // ─────────────────────────────
        stage('Integration Tests') {
            steps {
                withCredentials([
                    string(credentialsId: 'SUPABASE_URL', variable: 'SUPABASE_URL'),
                    string(credentialsId: 'SUPABASE_ANON_KEY', variable: 'SUPABASE_ANON_KEY')
                ]) {
                    sh '''
                        mkdir -p reports

                        export SUPABASE_URL=$SUPABASE_URL
                        export SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY

                        npm run test:integration \
                        -- --reporter=junit \
                        --outputFile=reports/integration-tests.xml || true
                    '''
                }
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: 'reports/integration-tests.xml'
                }
            }
        }

        // ─────────────────────────────
        // 7. COVERAGE
        // ─────────────────────────────
        stage('Coverage') {
            steps {
                withCredentials([
                    string(credentialsId: 'SUPABASE_URL', variable: 'SUPABASE_URL'),
                    string(credentialsId: 'SUPABASE_ANON_KEY', variable: 'SUPABASE_ANON_KEY')
                ]) {
                    sh '''
                        export SUPABASE_URL=$SUPABASE_URL
                        export SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY

                        npm run test:coverage || true
                    '''
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: 'coverage/**', allowEmptyArchive: true
                }
            }
        }

        // ─────────────────────────────
        // 8. SONARQUBE ANALYSIS
        // ─────────────────────────────
        stage('SonarQube Analysis') {
            steps {

                withSonarQubeEnv('sonarqube') {

                    withCredentials([
                        string(credentialsId: 'SONAR_TOKEN', variable: 'SONAR_TOKEN')
                    ]) {

                        sh '''
                            npx sonar-scanner \
                              -Dsonar.token=$SONAR_TOKEN \
                              -Dsonar.projectVersion=$BUILD_NUMBER
                        '''
                    }
                }
            }
        }

        // ─────────────────────────────
        // 9. QUALITY GATE
        // ─────────────────────────────
        stage('Quality Gate') {
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        // ─────────────────────────────
        // 10. FUNCTIONAL TESTS
        // ─────────────────────────────
        stage('Functional Tests') {
            when {
                anyOf {
                    branch 'main'
                    branch 'staging'
                }
            }

            steps {
                sh '''
                    npm run preview &
                    PREVIEW_PID=$!

                    sleep 8

                    pip install -r tests/functional/requirements.txt --quiet

                    cd tests/functional
                    pytest . -v --tb=short || true

                    kill $PREVIEW_PID || true
                '''
            }
        }

        // ─────────────────────────────
        // 11. DEPLOY
        // ─────────────────────────────
        stage('Deploy') {
            when {
                branch 'main'
            }

            steps {
                withCredentials([
                    sshUserPrivateKey(
                        credentialsId: 'DEPLOY_SSH_KEY',
                        keyFileVariable: 'SSH_KEY_FILE',
                        usernameVariable: 'DEPLOY_USER'
                    )
                ]) {

                    sh '''
                        ansible-playbook ansible/playbook.yml \
                          -i ansible/inventory.ini \
                          --private-key=$SSH_KEY_FILE \
                          -u $DEPLOY_USER \
                          --extra-vars "build_number=$BUILD_NUMBER" \
                          -v
                    '''
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }

        success {
            echo "✅ Pipeline SUCCESS — build #${BUILD_NUMBER}"
        }

        failure {
            echo "❌ Pipeline FAILED — build #${BUILD_NUMBER}"
        }
    }
}
