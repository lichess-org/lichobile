# update docs on gh-pages branch

git checkout gh-pages
rm -r docs/
git checkout master dist/docs/
mkdir docs/
mv dist/docs/* docs/.
rm -r dist/
git add -A
git commit
git checkout master

