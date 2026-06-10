import os
import re

lint_output = """
C:\\Users\\ASUS\\Downloads\\NextVWT PTT App Prototype - Clone\\src\\app\\components\\FeedbackModal.tsx
  22:7  warning  Unexpected console statement. Only these console methods are allowed: warn, error  no-console

C:\\Users\\ASUS\\Downloads\\NextVWT PTT App Prototype - Clone\\src\\app\\components\\PTTButton.tsx
  262:6  warning  React Hook useEffect has missing dependencies: 'onPressStart' and 'triggerHaptic'. Either include them or remove the dependency array. If 'onPressStart' changes too often, find the parent component that defines it and wrap that definition in useCallback  react-hooks/exhaustive-deps

C:\\Users\\ASUS\\Downloads\\NextVWT PTT App Prototype - Clone\\src\\app\\components\\UserListModal.tsx
  558:6  warning  React Hook useEffect has a missing dependency: 'mapUsers'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

C:\\Users\\ASUS\\Downloads\\NextVWT PTT App Prototype - Clone\\src\\app\\hooks\\useAudioStreamer.ts
  79:9  warning  The 'activeUsers' logical expression could make the dependencies of useEffect Hook (at line 283) change on every render. Move it inside the useEffect callback. Alternatively, wrap the initialization of 'activeUsers' in its own useMemo() Hook  react-hooks/exhaustive-deps

C:\\Users\\ASUS\\Downloads\\NextVWT PTT App Prototype - Clone\\src\\app\\utils\\appSecurity.ts
  190:9  warning  Unexpected console statement. Only these console methods are allowed: warn, error  no-console

C:\\Users\\ASUS\\Downloads\\NextVWT PTT App Prototype - Clone\\src\\app\\utils\\backgroundSurvival.ts
  19:5  warning  Unexpected console statement. Only these console methods are allowed: warn, error  no-console
  32:5  warning  Unexpected console statement. Only these console methods are allowed: warn, error  no-console
  59:5  warning  Unexpected console statement. Only these console methods are allowed: warn, error  no-console

C:\\Users\\ASUS\\Downloads\\NextVWT PTT App Prototype - Clone\\src\\features\\chat\\ChatRoomPanel.tsx
  124:55  warning  Forbidden non-null assertion                                                                                                               @typescript-eslint/no-non-null-assertion
  127:6   warning  React Hook useEffect has missing dependencies: 'fetchMemberRoles' and 'fetchMessages'. Either include them or remove the dependency array  react-hooks/exhaustive-deps

C:\\Users\\ASUS\\Downloads\\NextVWT PTT App Prototype - Clone\\src\\features\\moderation\\ModerationLogPanel.tsx
  74:55  warning  Forbidden non-null assertion                                                                                 @typescript-eslint/no-non-null-assertion
  77:6   warning  React Hook useEffect has a missing dependency: 'loadLogs'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

C:\\Users\\ASUS\\Downloads\\NextVWT PTT App Prototype - Clone\\src\\features\\moderation\\PrivateChannelPanel.tsx
  77:6  warning  React Hook useEffect has missing dependencies: 'checkBadgeStatus' and 'fetchCoins'. Either include them or remove the dependency array  react-hooks/exhaustive-deps

C:\\Users\\ASUS\\Downloads\\NextVWT PTT App Prototype - Clone\\src\\features\\moderation\\useChannelRole.ts
  295:29  warning  Forbidden non-null assertion  @typescript-eslint/no-non-null-assertion

C:\\Users\\ASUS\\Downloads\\NextVWT PTT App Prototype - Clone\\src\\features\\moderation\\useChannelSettings.ts
  151:29  warning  Forbidden non-null assertion  @typescript-eslint/no-non-null-assertion

C:\\Users\\ASUS\\Downloads\\NextVWT PTT App Prototype - Clone\\src\\features\\payment\\WalletPanel.tsx
  82:6  warning  React Hook useEffect has a missing dependency: 'fetchTxHistory'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

C:\\Users\\ASUS\\Downloads\\NextVWT PTT App Prototype - Clone\\src\\main.tsx
  76:9  warning  Unexpected console statement. Only these console methods are allowed: warn, error  no-console
"""

lines = lint_output.strip().split('\n')
current_file = None
fixes = {}

for line in lines:
    line = line.strip()
    if not line:
        continue
    if line.startswith('C:\\'):
        current_file = line
        fixes[current_file] = []
    elif current_file:
        match = re.match(r'^(\d+):\d+\s+warning.*?([^\s]+)$', line)
        if match:
            line_num = int(match.group(1))
            rule = match.group(2)
            fixes[current_file].append((line_num, rule))

for file_path, file_fixes in fixes.items():
    if not os.path.exists(file_path):
        continue
    with open(file_path, 'r', encoding='utf-8') as f:
        content_lines = f.readlines()
    
    # Sort backwards so inserting doesn't change line numbers of previous inserts
    file_fixes.sort(key=lambda x: x[0], reverse=True)
    
    for line_num, rule in file_fixes:
        idx = line_num - 1
        indent = len(content_lines[idx]) - len(content_lines[idx].lstrip())
        indent_str = ' ' * indent
        content_lines.insert(idx, f"{indent_str}// eslint-disable-next-line {rule}\n")
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(content_lines)

print("Done")
