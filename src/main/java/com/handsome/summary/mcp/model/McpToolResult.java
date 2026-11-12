package com.handsome.summary.mcp.model;

import java.util.List;
import java.util.Map;

/** Public, bounded conversation snapshot; contains no connection settings or tool inputs. */
public record McpToolResult(String id, String title, String status,
                            List<Map<String, String>> content, String structuredJson,
                            Boolean truncated) { }
