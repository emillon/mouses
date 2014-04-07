_obuild/chuchu/chuchu.js: _obuild/chuchu/chuchu.byte
	js_of_ocaml $<

_obuild/chuchu/chuchu.byte:
	ocp-build

clean:
	ocp-build -clean
