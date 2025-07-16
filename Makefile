
.PHONY: dev
dev:
	scripts/shoreman.sh

.PHONY: kill
kill: 
	[ -f .shoreman.pid ] && kill $$(cat .shoreman.pid) || true
	rm -f .shoreman.pid

.PHONY: test
test:
	npm run test:all

.PHONY: run
run:
	npm start

.PHONY: tail-log
tail-log:
	@tail -100 ./dev.log | perl -pe 's/\e\[[0-9;]*m(?:\e\[K)?//g'
