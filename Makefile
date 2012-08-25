PATH:=./node_modules/.bin/:./bin/:${PATH}

lib/tokens.js: LineBreak.txt exclude-classes.txt include-ranges.txt bin/generate-tokens
	generate-tokens \
		--exclude-classes exclude-classes.txt \
		--include-ranges include-ranges.txt \
		LineBreak.txt > $@

.PHONY: clean

clean:
	rm -rf lib/tokens.js
