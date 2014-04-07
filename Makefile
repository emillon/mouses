_obuild/chuchu/chuchu.js: _obuild/chuchu/chuchu.byte
	js_of_ocaml $<

_obuild/chuchu/chuchu.byte: *.ml
	ocp-build

clean:
	ocp-build -clean

watch:
	make ; while true ; do inotifywait -qe close_write *.ml; clear ; make ; echo OK ; done
