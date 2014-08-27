build:
	mv lib src
	coffee -o lib -c src

unbuild:
	rm -rf lib
	mv src lib

publish:
	make build
	npm publish .
	make unbuild
