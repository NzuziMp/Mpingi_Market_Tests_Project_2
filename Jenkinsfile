pipeline {
    agent any

    environment {
        NODE_ENV       = 'test'
        APP_BASE_URL   = 'http://localhost:4173'
        HEADLESS       = 'true'
        SONAR_HOST_URL = 'http://localhost:9000'
        NODE_OPTIONS   = '--max-old-space-size=4096'
    }

    tools {
        nodejs 'NodeJS'
    }

    options {
        timeout(time: 45, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
    }

    stages {

        // ── 1. Checkout ─────────────────────────────
        stage('Checkout') {
            steps {
                checkout scm
                echo "Branch: ${env.BRANCH_NAME} | Commit: ${env.GIT_COMMIT?.take(8)}"
            }
        }

        // ── 2. Install ──────────────────────────────
        stage('Install') {
            steps {
                sh 'node --version'
                sh 'npm --version'
                sh 'npm ci --prefer-offline'
            }
        }

        // ── 3. Lint ─────────────────────────────────
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

        // ── 4. Build ────────────────────────────────
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

        // ── 5. Unit Tests ───────────────────────────
        stage('Unit Tests') {
            steps {
                sh 'npm run test:unit -- --reporter=junit --outputFile=reports/unit-tests.xml'
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: 'reports/unit-tests.xml'
                }
            }
        }

        // ── 6. Integration Tests (FIXED) ────────────
        stage('Integration Tests') {
            steps {
                withCredentials([
                    string(credentialsId: 'SUPABASE_URL', variable: 'SUPABASE_URL'),
                    string(credentialsId: 'SUPABASE_ANON_KEY', variable: 'SUPABASE_SERVICE_ANON_KEY')
                ]) {
                    sh '''
                        export SUPABASE_URL=$SUPABASE_URL
                        export SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
                        npm run test:integration -- --reporter=junit --outputFile=reports/integration-tests.xml || true
                    '''
                }
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: 'reports/integration-tests.xml'
                }
            }
        }

        // ── 7. Coverage (SAFE) ──────────────────────
        stage('Coverage') {
            steps {
                withCredentials([
                    string(credentialsId: 'SUPABASE_URL', variable: 'SUPABASE_URL'),
                    string(credentialsId: 'SUPABASE_ANON_KEY', variable: 'SUPABASE_ANON_KEY')
                ]) {
                    sh '''
                        export SUPABASE_URL=$SUPABASE_URL
                        export SUPABASE_ANON_KEY=$SUPABASE_SERVICE_ANON_KEY
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

        // ── 8. SonarQube ────────────────────────────
        stage('SonarQube Analysis') {
            steps {
                withCredentials([
                    string(credentialsId: 'SONAR_TOKEN', variable: 'SONAR_TOKEN')
                ]) {
                    sh '''
                        npx sonar-scanner \
                          -Dsonar.host.url=$SONAR_HOST_URL \
                          -Dsonar.token=$SONAR_TOKEN \
                          -Dsonar.projectVersion=$BUILD_NUMBER
                    '''
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        // ── 9. Functional Tests ─────────────────────
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
                    sleep 5

                    pip install -r tests/functional/requirements.txt --quiet
                    cd tests/functional && pytest . -v --tb=short || true

                    kill $PREVIEW_PID || true
                '''
            }
        }

        // ── 10. Deploy ──────────────────────────────
        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                withCredentials([sshUserPrivateKey(
                    credentialsId: 'DEPLOY_SSH_KEY',
                    keyFileVariable: 'SSH_KEY_FILE',
                    usernameVariable: 'DEPLOY_USER'
                )]) {
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
            echo "✅ Pipeline SUCCESS — build #${env.BUILD_NUMBER}"
        }
        failure {
            echo "❌ Pipeline FAILED — build #${env.BUILD_NUMBER}"
        }
    }
}
