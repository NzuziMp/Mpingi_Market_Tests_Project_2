/*
 * Jenkins CI/CD Pipeline — Mpingi Market
 * ─────────────────────────────────────────────────────────────────────────────
 * Pipeline stages:
 *   1. Checkout       — clone source code from SCM
 *   2. Install        — npm install
 *   3. Lint           — ESLint static analysis
 *   4. Build          — Vite production build
 *   5. Unit Tests     — Vitest unit test suite
 *   6. Integration Tests — Vitest integration test suite (needs SUPABASE env vars)
 *   7. Coverage       — generate LCOV coverage report
 *   8. SonarQube      — static analysis + quality gate enforcement
 *   9. Functional Tests — Selenium / pytest E2E tests (needs running app)
 *  10. Deploy         — Ansible playbook for production deployment
 *
 * Required Jenkins Credentials:
 *   SUPABASE_URL          — Supabase project URL (Secret Text)
 *   SUPABASE_ANON_KEY     — Supabase anon key   (Secret Text)
 *   SONAR_TOKEN           — SonarQube user token (Secret Text)
 *   DEPLOY_SSH_KEY        — SSH key for production server (SSH credential)
 * ─────────────────────────────────────────────────────────────────────────────
 */
export VITE_SUPABASE_URL
export VITE_SUPABASE_ANON_KEY

pipeline {
    agent any

    environment {
        NODE_ENV            = 'test'
        APP_BASE_URL        = 'http://localhost:4173'
        HEADLESS            = 'true'
        SONAR_HOST_URL      = 'http://sonarqube:9000'
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

        // ── 1. Checkout ──────────────────────────────────────────────────────
        stage('Checkout') {
            steps {
                checkout scm
                echo "Building branch: ${env.BRANCH_NAME} | Commit: ${env.GIT_COMMIT?.take(8)}"
            }
        }

        // ── 2. Install Dependencies ──────────────────────────────────────────
        stage('Install') {
            steps {
                sh 'node --version'
                sh 'npm --version'
                sh 'npm ci --prefer-offline'
            }
        }

        // ── 3. Lint ───────────────────────────────────────────────────────────
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

        // ── 4. Build ──────────────────────────────────────────────────────────
        stage('Build') {
            steps {
                withCredentials([
                    string(credentialsId: 'SUPABASE_URL',      variable: 'VITE_SUPABASE_URL'),
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

        // ── 5. Unit Tests ─────────────────────────────────────────────────────
        stage('Unit Tests') {
            steps {
                sh 'npm run test:unit -- --reporter=verbose --reporter=junit --outputFile=reports/unit-tests.xml'
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: 'reports/unit-tests.xml'
                }
            }
        }

        // ── 6. Integration Tests ──────────────────────────────────────────────
        stage('Integration Tests') {
            steps {
                withCredentials([
                    string(credentialsId: 'SUPABASE_URL',      variable: 'VITE_SUPABASE_URL'),
                    string(credentialsId: 'SUPABASE_ANON_KEY', variable: 'VITE_SUPABASE_ANON_KEY')
                ]) {
                    sh 'npm run test:integration -- --reporter=verbose --reporter=junit --outputFile=reports/integration-tests.xml'
                }
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: 'reports/integration-tests.xml'
                }
            }
        }

        // ── 7. Coverage Report ────────────────────────────────────────────────
        stage('Coverage') {
            steps {
                withCredentials([
                    string(credentialsId: 'SUPABASE_URL',      variable: 'VITE_SUPABASE_URL'),
                    string(credentialsId: 'SUPABASE_ANON_KEY', variable: 'VITE_SUPABASE_ANON_KEY')
                ]) {
                    sh 'npm run test:coverage'
                }
            }
            post {
                always {
                    publishHTML(target: [
                        allowMissing         : false,
                        alwaysLinkToLastBuild: true,
                        keepAll              : true,
                        reportDir            : 'coverage',
                        reportFiles          : 'index.html',
                        reportName           : 'Vitest Coverage Report'
                    ])
                }
            }
        }

        // ── 8. SonarQube Analysis + Quality Gate ─────────────────────────────
        stage('SonarQube Analysis') {
            steps {
                withCredentials([string(credentialsId: 'SONAR_TOKEN', variable: 'SONAR_TOKEN')]) {
                    sh """
                        npx sonar-scanner \
                          -Dsonar.host.url=${SONAR_HOST_URL} \
                          -Dsonar.token=${SONAR_TOKEN} \
                          -Dsonar.projectVersion=${env.BUILD_NUMBER}
                    """
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

        // ── 9. Functional Tests (Selenium) ────────────────────────────────────
        stage('Functional Tests') {
            when {
                anyOf {
                    branch 'main'
                    branch 'staging'
                }
            }
            steps {
                sh """
                    npm run preview &
                    PREVIEW_PID=\$!
                    sleep 5

                    pip install -r tests/functional/requirements.txt --quiet
                    cd tests/functional && \
                    pytest . \
                        --html=../../reports/functional-tests.html \
                        --self-contained-html \
                        -v \
                        --tb=short \
                        --timeout=60
                    EXIT_CODE=\$?

                    kill \$PREVIEW_PID || true
                    exit \$EXIT_CODE
                """
            }
            post {
                always {
                    publishHTML(target: [
                        allowMissing         : true,
                        alwaysLinkToLastBuild: true,
                        keepAll              : true,
                        reportDir            : 'reports',
                        reportFiles          : 'functional-tests.html',
                        reportName           : 'Selenium Functional Test Report'
                    ])
                }
            }
        }

        // ── 10. Deploy (Ansible) ──────────────────────────────────────────────
        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                withCredentials([sshUserPrivateKey(
                    credentialsId : 'DEPLOY_SSH_KEY',
                    keyFileVariable: 'SSH_KEY_FILE',
                    usernameVariable: 'DEPLOY_USER'
                )]) {
                    sh """
                        ansible-playbook ansible/playbook.yml \
                          -i ansible/inventory.ini \
                          --private-key=\$SSH_KEY_FILE \
                          -u \$DEPLOY_USER \
                          --extra-vars "build_number=${env.BUILD_NUMBER}\" \
                          -v
                    """
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo "Pipeline SUCCESS — build #${env.BUILD_NUMBER}"
        }
        failure {
            echo "Pipeline FAILED — build #${env.BUILD_NUMBER}"
            emailext(
                subject: "FAILED: Mpingi Market Build #${env.BUILD_NUMBER}",
                body: "Build ${env.BUILD_NUMBER} failed. Check Jenkins: ${env.BUILD_URL}",
                to: 'nzuzi.mpingi@email.com'
            )
        }
    }
}