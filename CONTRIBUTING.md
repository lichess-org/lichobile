# Contributing

## Reporting bug

Please report the bug you find on veloce/lichobile/issues. Be sure to search
in the existing issues before in order to avoid duplicates.

Bug reports MUST contain:

* phone hardware
* phone operating system version
* version of lichess mobile beta
* steps to reproduce
* description of the observed behavior
* description of the expected behavior

If you have an Android device you can use [remote debugging tools](https://developer.chrome.com/devtools/docs/remote-debugging).

Sending Javascript errors with your bug report is extremely helpful.

Please do not report mobile application bugs in lichess forum.

## Pull requests

Check the requirements and setup guide in the [readme](README.md).

Mithril views should be written with the hyperscript function (imported as h),
and not JSX. Current JSX views are here for legacy reasons.

We use [tslint](https://palantir.github.io/tslint/) to enforce some coding conventions.
Before sending a pull request, please run the linter and ensure there is no error:

    $ npm run lint
