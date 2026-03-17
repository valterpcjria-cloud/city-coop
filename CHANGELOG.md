# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.22.0] - 2026-03-17

### Added
- **COOPCOINS v2.0**: Implementação da Carteira Virtual Escola.
- Transição do modelo de carteira individual por aluno para carteira coletiva da escola.
- Novos serviços para gestão de saldo e transações na `src/lib/coopcoins/services.ts`.
- Tipagem robusta para transações e saldos em `src/types/models.ts`.

### Fixed
- Melhorias na responsividade da navegação universal para todos os cargos.
- Registro de Service Worker para garantir instalabilidade PWA.
