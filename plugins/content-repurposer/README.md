# content-repurposer

一个 Claude Code 插件：把一篇文章 / 视频文案 / 想法，一键改写成多个社交媒体平台的**原生风格**版本——小红书笔记、Twitter/X 线程、公众号图文、短视频口播稿、知乎回答。

## 安装（本地测试）

```bash
claude --plugin-dir /local/mnt/workspace/workspace_8T/money/plugins/content-repurposer
```

或通过本仓库的本地 marketplace 安装：

```
/plugin marketplace add /local/mnt/workspace/workspace_8T/money
/plugin install content-repurposer@money-marketplace
```

## 使用

在 Claude Code 里直接调用：

```
/content-repurposer:repurpose
```

然后粘贴原始内容，或者先说明目标平台，例如：

```
/content-repurposer:repurpose 小红书,twitter
```

粘贴你的文章/文案，AI 会自动改写成对应平台的原生风格版本。

## 这个项目怎么"自动赚钱"

Skill/Plugin 本质是一段会被安装到用户本地的文本指令，**不能**在里面做真正的付费墙或license校验（用户装上之后内容对他完全可见，任何"检测密钥"逻辑都可以被绕过）。所以变现要放在分发层，而不是塞进 prompt 里，现实的路径按见效速度排序：

1. **自己先用**：用这个 skill 批量把自己/客户的长内容改写成 5 个平台的版本，节省人工改写时间，自己做自媒体/接私活代运营变现。这是验证质量的第一步，也是最快能看到"钱"的路径。
2. **私有仓库 + 付费获取访问权限**：把插件仓库设为私有，通过知识星球/小报童/自媒体交个人代付费获取 git 仓库访问权限或安装包，走"卖工具使用权"的订阅模式。
3. **提交到 Claude 插件市场/社区市场**免费获客，插件本身免费，靠插件里的个人主页/公众号引流反哺你的内容或咨询业务变现（间接变现，不直接收费）。
4. **升级为托管 SaaS**：如果验证到真实付费需求，再把核心 prompt 逻辑迁移成一个真正的 Web 服务（后端调 LLM API + Stripe/微信支付墙），才能做到真正的技术性收费门槛——这一步是本插件之外的下一阶段，需要单独立项。

## 后续可扩展方向

- 增加更多平台模板（B站简介、领英、Threads）。
- 支持从 URL/视频字幕自动抓取原始内容（需要额外脚本+网络工具，目前版本要求用户手动粘贴原文）。
- 加一个批处理脚本，一次处理多篇文章导出为文件。
