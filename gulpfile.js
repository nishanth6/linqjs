const gulp = require("gulp");
const del = require("del");
const typescript = require("gulp-typescript");
const typeDoc = require("gulp-typedoc");
const concat = require("gulp-concat");
const uglify = require("gulp-uglify-es").default;
const filter = require("gulp-filter");
const babel = require("gulp-babel");

/*
 * Clean tasks
 */
gulp.task("clean:dist", () => del("./dist/**", {force: true}));
gulp.task("clean:build", () => del("./build/**", {force: true}));
gulp.task("clean:docs", () => del("./docs/**", {force: true}));
gulp.task("clean", ["clean:dist", "clean:build", "clean:docs"]);

/*
 * Merge sources
 */
function typescriptSource() {
    return gulp.src([
        "./src/helper/*.ts",
        "./src/BasicCollection.ts",
        "./src/OrderedCollection.ts",
        "./src/internal/Collection.ts",
        "./src/internal/MinHeap.ts",
        "./src/internal/OrderedCollection.ts",
        "./src/module.ts"
    ])
        .pipe(concat("linq.ts"))
        .pipe(gulp.dest("./build"));
}

/*
 * Documentation
 */
gulp.task("docs", () => {
    return typescriptSource()
        .pipe(typeDoc({
            module: "ES6",
            target: "ES6",
            out: "./docs",
            name: "linq.js",
            ignoreCompilerErrors: true,
            excludeExternals: true,
            excludePrivate: true,
            version: true,
        }));
});

/*
 * Compile typescript
 */
function compileTypescript(module) {
    let project = typescript.createProject("./src/tsconfig.json", {
        module: module,
    });
    return typescriptSource()
        .pipe(project());
}

const supportedModules = ["ES6", "CommonJS", "AMD", "System"];
let buildTasks = [];
for (let module of supportedModules) {
    let moduleLower = module.toLowerCase();
    let moduleBuildTasks = [];
    let taskName;

    // task 1: compile to es6
    taskName = "compile:" + moduleLower + ":tsc";
    moduleBuildTasks.push(taskName);
    gulp.task(taskName, () => {
        return compileTypescript(module)
            .pipe(concat("linq." + moduleLower + ".js"))
            .pipe(gulp.dest("./dist"));
    });

    // task 2: compile to minified es6
    taskName = "compile:" + moduleLower + ":tsc-min";
    moduleBuildTasks.push(taskName);
    gulp.task(taskName, () => {
        return compileTypescript(module)
            .pipe(uglify())
            .pipe(concat("linq." + moduleLower + ".min.js"))
            .pipe(gulp.dest("./dist"));
    });

    // only create es5 tasks for supported module systems
    if (module !== "ES6") {

        // task 3: compile to es5
        taskName = "compile:" + moduleLower + ":es5";
        moduleBuildTasks.push(taskName);
        gulp.task(taskName, () => {
            return compileTypescript(module)
                .pipe(babel())
                .pipe(concat("linq." + moduleLower + ".es5.js"))
                .pipe(gulp.dest("./dist"));
        });

        // task 4: compile to minified es5
        taskName = "compile:" + moduleLower + ":es5-min";
        moduleBuildTasks.push(taskName);
        gulp.task(taskName, () => {
            return compileTypescript(module)
                .pipe(babel())
                .pipe(uglify())
                .pipe(concat("linq." + moduleLower + ".es5.min.js"))
                .pipe(gulp.dest("./dist"));
        });
    }

    taskName = "compile:" + moduleLower;
    buildTasks.push(taskName);
    gulp.task(taskName, moduleBuildTasks);
}
gulp.task("compile", buildTasks);

/*
 * Declaration
 */
gulp.task("declaration", () => {
    let project = typescript.createProject("./src/tsconfig.json", {
        module: "ES6",
        declaration: true,
    });
    return typescriptSource()
        .pipe(project())
        .pipe(filter("**/*.d.ts"))
        .pipe(gulp.dest("./dist"));
});

/*
 * Combined tasks
 */
gulp.task("all", ["declaration", "compile", "docs"]);

/*
 * Default task
 */
gulp.task("default", ["declaration", "compile"]);