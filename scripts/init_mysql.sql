-- QueryDoctor MySQL 初始化脚本

CREATE DATABASE IF NOT EXISTS querydoctor;
USE querydoctor;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 诊断历史表
CREATE TABLE IF NOT EXISTS diagnosis_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    query_text TEXT NOT NULL,
    diagnosis_result TEXT,
    suggestions TEXT,
    db_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 诊断报告表
CREATE TABLE IF NOT EXISTS diagnosis_reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    diagnosis_history_id BIGINT NOT NULL,
    report_type VARCHAR(50),
    report_content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (diagnosis_history_id) REFERENCES diagnosis_history(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 索引推荐表
CREATE TABLE IF NOT EXISTS index_recommendations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    diagnosis_history_id BIGINT NOT NULL,
    table_name VARCHAR(255) NOT NULL,
    column_name VARCHAR(255) NOT NULL,
    index_type VARCHAR(50),
    recommendation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (diagnosis_history_id) REFERENCES diagnosis_history(id) ON DELETE CASCADE,
    INDEX idx_table_name (table_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
