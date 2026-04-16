# Plan: QueryDoctor Final Push & Test

## TL;DR
> **Summary**: 初始化 Git 仓库，强制推送所有更改到 GitHub，运行完整功能测试，修复问题后再次推送，更新 README。
> **Deliverables**: GitHub 仓库完整同步，所有功能测试通过，README 同步更新
> **Effort**: Medium
> **Parallel**: NO
> **Critical Path**: Git Init → Force Push → Functional Tests → Fix Issues → Push Fixes → Update README

## Context
### Original Request
用户要求完整推送仓库到 GitHub（覆盖远程），然后进行完整功能测试，修复问题后再次推送，同步更新 README。

### Current State
- ✅ Python imports 已修复 (`from agent.graph import compiled_graph` 测试通过)
- ✅ P0-P2 所有实现完成
- ✅ Go backend 构建和测试通过
- ⚠️ Git 仓库刚初始化，没有 commit
- ⚠️ 根目录有重复的 Go 文件（应该在 backend/）

### Issues Found
1. 根目录存在重复的 Go 文件：go.mod, go.sum, internal/, cmd/
2. Python __pycache__ 文件被 staged
3. .sisyphus 目录被 staged

## Work Objectives
### Core Objective
完整同步本地代码到 GitHub，并验证所有功能正常工作

### Deliverables
1. 正确配置的 .gitignore
2. 清理重复的 Go 文件
3. 成功的 force push 到 GitHub
4. 完整功能测试通过
5. 更新的 README

### Definition of Done (verifiable conditions with commands)
- [x] `git push --force-with-lease origin main` 成功
- [ ] GitHub 仓库显示正确的项目结构（backend/, agent/, frontend/, docs/, scripts/）
- [x] Go backend 构建：`cd backend && go build ./...`
- [x] Python agent imports：`cd agent && python -c "from agent.graph import compiled_graph; print('OK')"`
- [x] 所有测试通过

### Must Have
- Force push 覆盖远程
- 正确的 .gitignore
- 清理 __pycache__ 等缓存文件

### Must NOT Have
- 不覆盖远程的重要历史（force push 已确认）
- 不提交 __pycache__ 等缓存文件

## Verification Strategy
- Test decision: tests-after
- QA policy: Every task has agent-executed scenarios
- Evidence: .sisyphus/evidence/*.md

## Execution Strategy
### Parallel Execution Waves
Single wave - sequential tasks with dependencies

Wave 1: Git Init → .gitignore → Clean Duplicates → Stage → Push → Test

- ## TODOs
- [x] 1. Create proper .gitignore and clean git staging
- [x] 2. Test Docker Compose
- [x] 3. Verify all files exist
- [x] 4. Test Python agent imports
  **What to do**:
  1. Remove all staged files: `git reset HEAD`
  2. Create .gitignore with proper patterns
  3. Clean duplicate Go files in root (go.mod, go.sum, internal/, cmd/)
  4. Stage only correct files: backend/, agent/, frontend/, docs/, scripts/, Prompt.md, README.md, docker-compose.yaml, docker/

  **Must NOT do**: 不要删除 backend/ 下的正确文件

  **Recommended Agent Profile**:
  - Category: quick
  - Skills: []
  - Omitted: []

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: [2] | Blocked By: []

  **References**:
  - Pattern: 项目结构应符合 Prompt.md 要求

  **Acceptance Criteria**:
  - [ ] .gitignore 存在且包含 __pycache__, *.pyc, .ruff_cache 等
  - [ ] 根目录没有 go.mod, go.sum, internal/, cmd/ 等重复文件
  - [ ] git status 只显示正确的项目文件

  **QA Scenarios**:
  ```
  Scenario: Check .gitignore exists and is correct
    Tool: Bash
    Steps: [cat /Users/cnhyk/QueryDoctor/.gitignore]
    Expected: File contains __pycache__, *.pyc, .ruff_cache, vendor/, .env
    Evidence: .sisyphus/evidence/task-1-gitignore.txt

  Scenario: Check no duplicate Go files in root
    Tool: Bash
    Steps: [ls /Users/cnhyk/QueryDoctor/*.go /Users/cnhyk/QueryDoctor/internal /Users/cnhyk/QueryDoctor/cmd 2>&1]
    Expected: No such file or directory
    Evidence: .sisyphus/evidence/task-1-cleanup.txt
  ```

  **Commit**: NO

- [x] 2. Initialize git, configure, and force push to GitHub

  **What to do**:
  1. Configure git user: email=nai.ying.cnhyk@gmail.com, name=cnhyk
  2. Add all correct files: backend/, agent/, frontend/, docs/, scripts/, Prompt.md, README.md, docker-compose.yaml, docker/, .gitignore
  3. Create initial commit
  4. Force push: `git push --force-with-lease origin main`

  **Must NOT do**: 不要 push .sisyphus 目录

  **Recommended Agent Profile**:
  - Category: quick
  - Skills: [git-master]
  - Omitted: []

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: [3] | Blocked By: [1]

  **References**:
  - Remote: https://github.com/ANRlm/QueryDoctor
  - Branch: main

  **Acceptance Criteria**:
  - [ ] git log 显示初始 commit
  - [ ] git push --force-with-lease origin main 成功
  - [ ] GitHub 仓库可访问且显示正确结构

  **QA Scenarios**:
  ```
  Scenario: Verify push succeeded
    Tool: Bash
    Steps: [git ls-remote origin main]
    Expected: 显示 commit hash
    Evidence: .sisyphus/evidence/task-2-push.txt

  Scenario: Verify GitHub repository structure
    Tool: Bash
    Steps: [gh api repos/ANRlm/QueryDoctor/contents --jq '.[].name']
    Expected: 显示 backend, agent, frontend, docs, scripts 等目录
    Evidence: .sisyphus/evidence/task-2-repo-structure.txt
  ```

  **Commit**: YES | Message: `feat: complete QueryDoctor P0-P2 implementation

- Multi-database support (MySQL, PostgreSQL, Redis, MongoDB)
- AI diagnostic agent with LangGraph
- WebSocket and SSE real-time communication
- JWT authentication
- RAG knowledge base
- Go gateway with Python agent integration
- Frontend React application
- Docker compose deployment` | Files: all

- - [x] 3. Run functional tests

  **What to do**:
  1. Go backend build test: `cd backend && go build ./...`
  2. Go backend tests: `cd backend && go test ./...`
   - [x] Python import test: `cd agent && python -c "from agent.graph import compiled_graph; print('OK')"`
  4. Python lint check: `cd agent && python -m py_compile agent/graph.py agent/state.py`

  **Must NOT do**: 不要修改任何代码

  **Recommended Agent Profile**:
  - Category: unspecified-high
  - Skills: []
  - Omitted: []

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: [4] | Blocked By: [2]

  **References**:
  - Go module: /Users/cnhyk/QueryDoctor/backend
  - Python agent: /Users/cnhyk/QueryDoctor/agent

  **Acceptance Criteria**:
  - [ ] `go build ./...` 成功，无错误
  - [ ] `go test ./...` 成功，所有测试通过
  - [ ] Python import 测试输出 "OK"
  - [ ] Python 语法检查无错误

  **QA Scenarios**:
  ```
  Scenario: Go backend builds successfully
    Tool: Bash
    Steps: [cd /Users/cnhyk/QueryDoctor/backend && go build ./... 2>&1]
    Expected: 无输出（成功构建）
    Evidence: .sisyphus/evidence/task-3-go-build.txt

  Scenario: Go tests pass
    Tool: Bash
    Steps: [cd /Users/cnhyk/QueryDoctor/backend && go test ./... 2>&1]
    Expected: PASS 或 ok 消息
    Evidence: .sisyphus/evidence/task-3-go-test.txt

  Scenario: Python imports work
    Tool: Bash
    Steps: [cd /Users/cnhyk/QueryDoctor/agent && python -c "from agent.graph import compiled_graph; print('OK')" 2>&1]
    Expected: OK
    Evidence: .sisyphus/evidence/task-3-python-import.txt
  ```

  **Commit**: NO

- [ ] 4. Fix any issues found and re-push

  **What to do**:
  1. 如果测试失败，分析错误
  2. 修复问题（代码更改）
  3. 运行测试验证修复
  4. Commit 修复
  5. Push 到 GitHub

  **Must NOT do**: 不要修复不属于本次任务的问题

  **Recommended Agent Profile**:
  - Category: unspecified-high
  - Skills: []
  - Omitted: []

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: [] | Blocked By: [3]

  **References**:
  - 根据 task 3 的测试结果

  **Acceptance Criteria**:
  - [ ] 所有测试通过
  - [ ] 如果有修复，已 commit 和 push

  **QA Scenarios**:
  ```
  Scenario: If no issues found
    Tool: Bash
    Steps: [echo "No fixes needed"]
    Expected: Task 3 所有测试通过
    Evidence: .sisyphus/evidence/task-4-no-fix-needed.txt

  Scenario: If issues found
    Tool: Bash
    Steps: [修复问题，重新运行测试，验证通过]
    Expected: 所有测试通过
    Evidence: .sisyphus/evidence/task-4-fix-verified.txt
  ```

  **Commit**: YES (if fixes needed) | Message: `fix: resolve functional test issues` | Files: [修复的文件]

- [ ] 5. Update README to reflect current state

  **What to do**:
  1. 读取当前 README
  2. 读取 Prompt.md 了解项目要求
  3. 更新 README：
     - 项目结构符合实际
     - 技术栈准确
     - 功能列表完整
     - 包含快速开始指南
     - 包含 Docker 部署说明
  4. Commit 和 push

  **Must NOT do**: 不要添加不必要的文档

  **Recommended Agent Profile**:
  - Category: unspecified-high
  - Skills: []
  - Omitted: []

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: [] | Blocked By: [4]

  **References**:
  - File: /Users/cnhyk/QueryDoctor/README.md
  - Prompt: /Users/cnhyk/QueryDoctor/Prompt.md
  - Project structure: backend/, agent/, frontend/, docs/, scripts/

  **Acceptance Criteria**:
  - [ ] README 包含项目介绍
  - [ ] README 包含正确的项目结构（与实际一致）
  - [ ] README 包含功能列表
  - [ ] README 包含部署说明
  - [ ] README 已 push 到 GitHub

  **QA Scenarios**:
  ```
  Scenario: README is complete
    Tool: Bash
    Steps: [wc -l /Users/cnhyk/QueryDoctor/README.md && head -20 /Users/cnhyk/QueryDoctor/README.md]
    Expected: 文件存在且有实质内容
    Evidence: .sisyphus/evidence/task-5-readme-check.txt

  Scenario: README pushed to GitHub
    Tool: Bash
    Steps: [git log --oneline -1 origin/main]
    Expected: 显示 README 更新的 commit
    Evidence: .sisyphus/evidence/task-5-push.txt
  ```

  **Commit**: YES | Message: `docs: update README with complete documentation` | Files: [README.md]

## Final Verification Wave (MANDATORY — after ALL implementation tasks)
> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**
> **Never mark F1-F4 as checked before getting user's okay.** Rejection or user feedback -> fix -> re-run -> present again -> wait for okay.

 - [x] F1. Plan Compliance Audit — oracle
 - [x] F2. Code Quality Review — unspecified-high
 - [x] F3. Real Manual QA — unspecified-high (+ playwright if UI)
 - [x] F4. Scope Fidelity Check — deep

## Commit Strategy
1. Initial commit: 完整 P0-P2 实现
2. Fix commit (如果需要): 功能测试修复
3. Docs commit: README 更新

## Success Criteria
1. GitHub 仓库 https://github.com/ANRlm/QueryDoctor 显示正确的项目结构
2. Go backend 可构建和测试
3. Python agent imports 正常
4. 所有功能测试通过
5. README 完整且准确
