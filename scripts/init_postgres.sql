-- QueryDoctor PostgreSQL 初始化脚本

CREATE DATABASE querydoctor;

\c querydoctor;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);

-- 诊断历史表
CREATE TABLE IF NOT EXISTS diagnosis_history (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    query_text TEXT NOT NULL,
    diagnosis_result TEXT,
    suggestions TEXT,
    db_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_diagnosis_history_user_id ON diagnosis_history(user_id);
CREATE INDEX idx_diagnosis_history_created_at ON diagnosis_history(created_at);

-- 诊断报告表
CREATE TABLE IF NOT EXISTS diagnosis_reports (
    id SERIAL PRIMARY KEY,
    diagnosis_history_id INTEGER NOT NULL REFERENCES diagnosis_history(id) ON DELETE CASCADE,
    report_type VARCHAR(50),
    report_content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引推荐表
CREATE TABLE IF NOT EXISTS index_recommendations (
    id SERIAL PRIMARY KEY,
    diagnosis_history_id INTEGER NOT NULL REFERENCES diagnosis_history(id) ON DELETE CASCADE,
    table_name VARCHAR(255) NOT NULL,
    column_name VARCHAR(255) NOT NULL,
    index_type VARCHAR(50),
    recommendation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_index_recommendations_table_name ON index_recommendations(table_name);

-- 函数: 自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 触发器: 用户表自动更新
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
