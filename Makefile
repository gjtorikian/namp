all:
	@cp lib/namp.js namp.js
	@uglifyjs -o namp.min.js namp.js

clean:
	@rm namp.js
	@rm namp.min.js

.PHONY: clean all
