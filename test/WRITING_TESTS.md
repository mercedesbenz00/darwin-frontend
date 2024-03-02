# Writing tests

## e2e Tests

We use [testcafé](https://devexpress.github.io/testcafe/) for writing e2e tests.

### Structure

The file structure for e2e tests looks as follows:

```
e2e
├─ fixtures
├─ models
└── roles
```

The `fixtures` directory contains all [fixtures](https://devexpress.github.io/testcafe/documentation/test-api/test-code-structure.html#fixtures).
Each fixture consists of one or more [tests](https://devexpress.github.io/testcafe/documentation/test-api/test-code-structure.html#tests).

The `models` directory contains all [page models](https://devexpress.github.io/testcafe/documentation/recipes/use-page-model.html).

> A Page Model is a test automation pattern that allows you to create an abstraction of the tested page and use it in test code to refer to page elements.

The `roles` directory contains all available [user roles](https://devexpress.github.io/testcafe/documentation/test-api/authentication/user-roles.html).

> A piece of logic that logs in a particular user is called a role.

When writing a test which for instanse tests the “foo” component in the scope of the page “bar” using the user "qux", we create a new fixture:

```
mkdir test/e2e/fixtures/bar
touch test/e2e/fixtures/bar/foo.fixture.js
```

A page model for the page “bar”:

```
touch test/e2e/models/bar.model.js
```

And a user role for the user “qux”:

```
touch test/e2e/roles/qux.role.js
```

Have a look at some of the existing fixtures in order to understand how the tests are organized. A good starting point is probably [`test/e2e/fixtures/login.fixture.js`](https://github.com/v7labs/darwin-frontend/blob/master/test/e2e/fixtures/login.fixture.js)

### Running tests locally

If you want to run tests on your machine, set up your backend with `MIX_ENV=e2e mix ecto.setup`.
If there were db migrations since last running the test suite (or if something went wrong while developing the test suite), run `MIX_ENV=e2e mix ecto.reset`.
Now you start up your backend with `MIX_ENV=e2e mix phx.server` and your frontend with `npm run serve`.
Next make sure you are in the frontend working directory and either run `npm run test:e2e:local` in your terminal
or execute `testcafe` directly with `./node_modules/.bin/testcafe -c 3 chrome:emulation:width=1440;height=806; test/e2e/**/*.fixture.js test/e2e/**/**/*.fixture.js`.
You can run only a specific fixture by changing the command to `npm run test:e2e:single -- test/e2e/**/your.fixture.js` in your terminal
or execute `testcafe` directly with `./node_modules/.bin/testcafe -c 3 chrome:emulation:width=1440;height=806; test/e2e/**/your.fixture.js`.
Using [`testcafe-live`](https://github.com/DevExpress/testcafe-live#testcafe-live) (not part of this project), you can halt the execution of the tests on failure.
You might also be interested in debugging testcafé tests. Please refer to the documentation [here](https://devexpress.github.io/testcafe/documentation/test-api/debugging.html).

### Troubleshooting tests on Jenkins
Testcafé is currently set up to take screenshots of test failures on Jenkins. So if you want to check a test that is failing on Jenkins,
you will find the screenshots in the `test/output/screenshots` directory of the corresponding Jenkins workspace. And here is how you get to the workspace: https://stackoverflow.com/a/46838278/601466

### Best practices for test reliability

Testcafe has built in waiting mechanisms, which break if we do unorthodox things. To avoid breaking we should adhere to the following

#### All props should be `Selector` or `ClientFunction`

These work with built in waiting mechanisms

#### Minimize use of actions

We should rely on action functions minimally and instead interact with selectors as the user would

### Best practices for test speed

#### Minimize navigation

Do not navigate using `page.navigateTo` more than once per test (including the initial login animation).

Instead, click through the interface to navigate, as it's much faster than a full page load.


### TypeScript

Testcafe uses an internal typescript config which uses some defaults that it doesn't allow overriding off.

Due to this, we need to specify a custom `tsconfig.json` different from the project default, to avoid conflicts.

Any change to the project default `tsconfig.json` should be propagated to `test/e2e/tsconfig.json`,
if allowed by testcafe.
