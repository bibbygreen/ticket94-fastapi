.PHONY: run lint test lock deploy migration generate_migration

run:
	alembic upgrade head
	alembic check
	uvicorn src.main:app --reload

lint:
	ruff format
	ruff check --fix

test:
	python3 -m pytest -s -v

lock:
	poetry export -f requirements.txt -o ./requirements/prod.txt
	poetry export -f requirements.txt -o ./requirements/dev.txt --with dev

deploy:
	ansible-playbook -i ./ansible/inventory.ini ./ansible/playbook.yml

generate_migration:
	@read -p "Enter migration name: " migration_name; \
	alembic revision --autogenerate -m "$${migration_name}"

migration:
	alembic upgrade head

downgrade_migration:
	alembic downgrade -1