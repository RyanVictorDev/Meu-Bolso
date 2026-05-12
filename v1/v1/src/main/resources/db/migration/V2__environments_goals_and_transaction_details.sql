create table environments (
    id uuid primary key,
    owner_user_id uuid not null references users(id) on delete cascade,
    name varchar(120) not null,
    description varchar(280),
    created_at timestamp with time zone not null
);

create table environment_members (
    id uuid primary key,
    environment_id uuid not null references environments(id) on delete cascade,
    user_id uuid not null references users(id) on delete cascade,
    role varchar(16) not null,
    created_at timestamp with time zone not null
);

insert into environments (id, owner_user_id, name, description, created_at)
select
    id,
    id,
    'Meu ambiente',
    'Ambiente padrão migrado automaticamente',
    created_at
from users;

insert into environment_members (id, environment_id, user_id, role, created_at)
select
    users.id,
    environments.id,
    users.id,
    'ADMIN',
    users.created_at
from users
join environments on environments.owner_user_id = users.id;

alter table categories add column environment_id uuid references environments(id) on delete cascade;
alter table transactions add column environment_id uuid references environments(id) on delete cascade;
alter table transactions add column created_by_user_id uuid references users(id) on delete set null;
alter table budgets add column environment_id uuid references environments(id) on delete cascade;

update categories
set environment_id = environments.id
from environments
where categories.user_id = environments.owner_user_id;

update transactions
set environment_id = environments.id,
    created_by_user_id = transactions.user_id
from environments
where transactions.user_id = environments.owner_user_id;

update budgets
set environment_id = environments.id
from environments
where budgets.user_id = environments.owner_user_id;

alter table categories alter column environment_id set not null;
alter table transactions alter column environment_id set not null;
alter table budgets alter column environment_id set not null;

create table goals (
    id uuid primary key,
    environment_id uuid not null references environments(id) on delete cascade,
    created_by_user_id uuid not null references users(id) on delete restrict,
    name varchar(120) not null,
    description varchar(280),
    target_cents bigint not null,
    due_on date,
    archived boolean not null default false,
    created_at timestamp with time zone not null
);

create table goal_contributions (
    id uuid primary key,
    goal_id uuid not null references goals(id) on delete cascade,
    created_by_user_id uuid not null references users(id) on delete restrict,
    amount_cents bigint not null,
    contributed_on date not null,
    note varchar(180),
    created_at timestamp with time zone not null
);

create index idx_environments_owner on environments(owner_user_id);
create index idx_environment_members_user on environment_members(user_id);
create index idx_environment_members_environment on environment_members(environment_id);
create unique index uq_environment_members_user on environment_members(environment_id, user_id);

create index idx_categories_environment on categories(environment_id);
create index idx_transactions_environment_occurred_on on transactions(environment_id, occurred_on desc);
create index idx_transactions_environment_month on transactions(environment_id, type, occurred_on);
create index idx_budgets_environment_month on budgets(environment_id, month_ref);
create unique index uq_categories_environment_type_name on categories(environment_id, type, normalized_name);
create unique index uq_budgets_environment_month_category on budgets(environment_id, month_ref, category_id);

create index idx_goals_environment on goals(environment_id);
create index idx_goal_contributions_goal on goal_contributions(goal_id);
