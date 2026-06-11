# 激活码服务脚本 — 运行环境与适配说明

## 运行环境推断

本脚本运行于一个**服务端 Node.js 脚本执行平台**，具有以下特征：

- 运行时：Node.js，使用 ES Modules（`import` / `export`）
- 脚本由平台在服务端**动态执行**，执行前平台将上下文变量**直接注入全局作用域**，脚本无需声明即可使用
- 脚本通过 `process.stdout.write()` 向平台返回结果，平台捕获 stdout 作为响应内容
- 脚本**不负责**鉴权、用户管理、积分计算、路由等平台层工作，只处理业务逻辑

---

## 平台注入变量

平台在执行脚本前会自动注入以下全局变量，脚本可直接使用：

| 变量名 | 来源 | 类型 | 说明 |
|---|---|---|---|
| `FIRMWARE_ID` | 提供商配置，由用户选择后传入 | 十六进制字符串，多个时以英文逗号 `,` 分隔 | 标识目标固件，由提供商预先配置可选项 |
| `MAC` | 终端用户输入 | 字符串，批量时以英文逗号 `,` 分隔 | 设备密钥 / 硬件 MAC 等纯 HEX 字符 |
| `REQUESTER` | 平台自动注入 | 字符串 | 当前发起请求的已认证用户名 |

---

## 输出规范

脚本**必须**且**只能**通过以下方式返回结果，平台不处理任何其他输出形式：

```javascript
process.stdout.write(JSON.stringify({ ... }));
```

### 成功响应

无论单个还是批量，`code` 字段**统一为数组**：

```json
{ "ok": true, "code": ["激活码1", "激活码2"] }
```

### 失败响应

```json
{ "ok": false, "error": "错误描述" }
```

**脱敏要求**：所有错误信息中不得暴露内部凭据、ID 等敏感字段，应将其替换为 `***`。

---

## 批量输入规则

当 `MAC` 为逗号分隔的多个值时视为批量请求：

- 脚本应**先验证所有输入**，全部合法后再发起任何外部请求
- 任意一个输入不合法，立即返回错误，指明第几个、内容是什么、问题是什么，**不发起请求**
- 返回的 `code` 数组顺序与输入顺序一一对应

---

## 适配示例

以下为一个符合本平台规范的最简脚本骨架，演示正确的变量使用方式和输出格式：

```javascript
import http from 'http';

// FIRMWARE_ID、MAC、REQUESTER 由平台注入，无需声明

async function main() {
  try {
    // FIRMWARE_ID: 平台注入的十六进制固件标识，可能为逗号分隔的多个值
    // 此处取第一个作为演示
    const firmwareId = String(FIRMWARE_ID).split(',')[0].trim();

    // MAC: 用户输入，支持批量（逗号分隔）
    const keys = String(MAC).split(',').map(s => s.trim());

    // 验证阶段：全部通过才继续
    for (let i = 0; i < keys.length; i++) {
      if (!keys[i]) {
        process.stdout.write(JSON.stringify({
          ok: false,
          error: `第 ${i + 1} 个输入（"${keys[i]}"）不合法：值为空`
        }));
        return;
      }
    }

    // 拼接请求，REQUESTER 由平台注入，直接传递给后端用于审计
    const query = `id=${firmwareId}&key=${keys.join(',')}&user=${REQUESTER}`;
    const url = `http://example.com:8080/api?${query}`;

    // 发起请求
    const result = await new Promise((resolve, reject) => {
      const req = http.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      });
      req.on('error', reject);
      req.setTimeout(10000, () => { req.destroy(); reject(new Error('请求超时')); });
    });

    // 解析响应，提取所有结果
    const matches = [...result.matchAll(/结果\d+[：:]\s*([^\n\r]+)/g)];
    if (matches.length > 0) {
      const code = matches.map(m => m[1].trim());
      process.stdout.write(JSON.stringify({ ok: true, code }));
    } else {
      process.stdout.write(JSON.stringify({ ok: false, error: '未找到有效结果' }));
    }

  } catch (e) {
    // 脱敏：不暴露内部 ID 等敏感信息
    const safeMsg = String(e.message).replace(/[0-9a-fA-F]{32}/g, '***');
    process.stdout.write(JSON.stringify({ ok: false, error: safeMsg }));
  }
}

main();
```

**调用示意（由平台完成，脚本提供商无需关心）：**

```
# 单个
平台注入: FIRMWARE_ID="a1b2c3d4...", MAC="81233f39410f02", REQUESTER="alice"

# 批量
平台注入: FIRMWARE_ID="a1b2c3d4...", MAC="81233f39410f02,18bc5a6cc3dd", REQUESTER="alice"
```

**期望输出：**

```json
{ "ok": true, "code": ["RESULT001", "RESULT002"] }
```

---

## 注意事项

1. **不要**在错误信息中暴露各种内部请求鉴权（例如用户密钥）的实际值。
2. 输出**必须是合法 JSON**，且只调用一次 `process.stdout.write`。
3. 脚本执行时间限制 **6 秒以内**，超时服务器会自动结束脚本运行。