create table users (
    id uuid primary key,
    name varchar(120) not null,
    email varchar(180) not null unique,
    password_hash varchar(255) not null,
    created_at timestamp with time zone not null
);

create table refresh_tokens (
    id uuid primary key,
    user_id uuid not null references users(id) on delete cascade,
    token_hash varchar(128) not null unique,
    expires_at timestamp with time zone not null,
    revoked boolean not null default false,
    created_at timestamp with time zone not null
);

create table categories (
    id uuid primary key,
    user_id uuid not null references users(id) on delete cascade,
    name varchar(80) not null,
    normalized_name varchar(80) not null,
    type varchar(16) not null,
    emoji varchar(16),
    created_at timestamp with time zone not null
);

create table transactions (
    id uuid primary key,
    user_id uuid not null references users(id) on delete cascade,
    type varchar(16) not null,
    category_id uuid not null references categories(id) on delete restrict,
    description varchar(240),
    amount_cents bigint not null,
    occurred_on date not null,
    created_at timestamp with time zone not null
);

create table budgets (
    id uuid primary key,
    user_id uuid not null references users(id) on delete cascade,
    month_ref varchar(7) not null,
    category_id uuid not null references categories(id) on delete restrict,
    limit_cents bigint not null,
    created_at timestamp with time zone not null
);

create index idx_categories_user on categories(user_id);
create index idx_transactions_user_occurred_on on transactions(user_id, occurred_on desc);
create index idx_transactions_user_month on transactions(user_id, type, occurred_on);
create index idx_budgets_user_month on budgets(user_id, month_ref);
create index idx_refresh_tokens_user on refresh_tokens(user_id);

create unique index uq_categories_user_type_name on categories(user_id, type, normalized_name);
create unique index uq_budgets_user_month_category on budgets(user_id, month_ref, category_id);
