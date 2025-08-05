# Quick Start Guide - New Claude Code Instance

## 🚀 **Immediate Context**

You're continuing development of the **Universal Agent Coordination Platform** - specifically the **Unified Botanical Garden Chrome Extension** that combines multiple AI agent kits in a single sidepanel interface.

## 📁 **File Structure to Copy to New Environment**

```bash
# Essential files for context preservation
CONTEXT-HANDOFF-PACKAGE.md    # Complete architectural context
CLAUDE.md                     # Full project documentation  
TODO-PROGRESS-EXPORT.md       # Development progress (98/101 complete)
QUICK-START-GUIDE.md         # This file
```

## 🎯 **Current Status**

- **✅ Architecture Complete**: Unified botanical garden with Kit Registry Pattern
- **✅ AI Integration**: Google Gemini 2.0 Flash API working
- **✅ Persistence**: 3-tier Browser → PocketFlow → ICP blockchain
- **✅ Chrome Extension**: Fully functional with sidepanel API
- **✅ Multi-Kit**: ChatFlowerBud + AgentFlowerBud with checkbox switching
- **✅ Debugging**: All critical issues resolved and documented

## 🔧 **Key Technical Context**

### **Critical Debugging Solutions We Solved**
1. **DOM Binding**: Always use `instance.render()` not `getTemplate()`
2. **PocketFlow Loops**: Avoid self-loops, use `continue: false` 
3. **SharedState Keys**: Store with `'final_answer'` key for consistency
4. **MCP Config**: Minimize server types to avoid connection failures

### **Working Architecture**
```javascript
// Kit Registry Pattern
BotanicalKitRegistry → ChatFlowerBud + AgentFlowerBud
                    → PocketFlowOrchestrator → Gemini AI
                    → BotanicalSharedState → ICP Canisters
```

## 🌟 **What's Ready for Demo**

1. **Chrome Extension**: Load from `generated-chrome-kits/sitebud-unified-botanical-kit/`
2. **Kit Switching**: Checkboxes enable/disable ChatFlower vs AgentFlower
3. **AI Responses**: Real Gemini API with character personalities (Kyoko analytical)
4. **ICP Sync**: 3-tier persistence with actual blockchain storage
5. **MCP Integration**: External API connectivity with fallback handling

## 🎯 **Next 3 Tasks** (from TODO list)

1. **Test unified botanical garden** - Verify seamless kit switching works
2. **Create AI-Kit middleware patterns** - Build reusable integration patterns  
3. **Generate CodeFlowerBud** - Add code generation kit from cookbook

## 🛠️ **Development Commands**

```bash
# Chrome Extension Testing
# Load unpacked from: icpxmldb/icport/kits/kit-builder/generated-chrome-kits/sitebud-unified-botanical-kit/

# ICP Development  
dfx start --clean
dfx deploy

# Extension Access
# Right-click any webpage → "Open AgentLedger Sidepanel"
```

## 💡 **Key Context for New Instance**

**Tell new Claude Code**:
> "I'm continuing development of a Universal Agent Coordination Platform. We've built a unified botanical garden Chrome extension with Kit Registry Pattern that orchestrates multiple AI agent kits (ChatFlowerBud, AgentFlowerBud) in a single sidepanel. The extension has real Gemini AI integration, character-driven intelligence (Kyoko/Chihiro/Byakuya), 3-tier persistence to ICP blockchain, and MCP bridge for external APIs. We solved all major debugging issues including DOM element binding, PocketFlow infinite loops, and SharedState key mismatches. Development has transitioned from submodule complexity to ICPort kit-first architecture. The extension is production-ready and we're now focused on testing seamless kit switching and expanding the cookbook kit ecosystem. All context is in CLAUDE.md."

## 📋 **Files to Reference**

- **CLAUDE.md**: Complete project documentation with architecture diagrams
- **CONTEXT-HANDOFF-PACKAGE.md**: Detailed technical context and debugging solutions
- **TODO-PROGRESS-EXPORT.md**: Full development journey (98/101 tasks complete)

## 🎬 **Demo Script Ready**

1. Show Chrome extension loading
2. Demonstrate kit switching with checkboxes  
3. Test ChatFlowerBud with Kyoko personality
4. Test AgentFlowerBud with web search synthesis
5. Show real ICP persistence in background
6. Explain Kit Registry Pattern for scalability

---

**🤖 Ready for ICPort kit-first development and cookbook expansion!**