task("buildFrontend") {
    dependsOn("installDepsForUI")
    doLast {
        exec {
            workingDir("${project.projectDir}/ui")
            commandLine(npmw.nodeCommand, npmw.npmCommand, "run", "build")
        }
    }
} 