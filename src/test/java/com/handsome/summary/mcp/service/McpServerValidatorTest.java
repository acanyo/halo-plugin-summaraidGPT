package com.handsome.summary.mcp.service;

import static org.assertj.core.api.Assertions.*;

import com.handsome.summary.mcp.model.McpSettings;
import java.util.List;
import org.junit.jupiter.api.Test;

class McpServerValidatorTest {
    private final McpServerValidator validator = new McpServerValidator();

    @Test
    void privateAccessRequiresExplicitOptInAndMetadataIsAlwaysBlocked() {
        assertThatThrownBy(() -> validator.validate(server("http://127.0.0.1/mcp", false, List.of())))
            .isInstanceOf(IllegalArgumentException.class);
        assertThat(validator.validate(server("http://127.0.0.1/mcp", true, List.of())).getHost()).isEqualTo("127.0.0.1");
        assertThatThrownBy(() -> validator.validate(server("http://169.254.169.254/mcp", true, List.of())))
            .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void rejectsCredentialsInUrlsAndHeaderInjection() {
        for (var url : List.of("file:///tmp/mcp", "/mcp", "http://user:secret@127.0.0.1/mcp", "http://127.0.0.1/mcp?token=secret")) {
            assertThatThrownBy(() -> validator.validate(server(url, true, List.of())))
                .isInstanceOf(IllegalArgumentException.class);
        }
        for (var header : List.of(new McpSettings.Header("Host", "evil"),
            new McpSettings.Header("X-API-Key", "key\r\nHost: evil"))) {
            assertThatThrownBy(() -> validator.validate(server("http://127.0.0.1/mcp", true, List.of(header))))
                .isInstanceOf(IllegalArgumentException.class);
        }
    }

    private McpSettings.Server server(String url, boolean privateAccess, List<McpSettings.Header> headers) {
        return new McpSettings.Server("test", "Test", true, url, "", headers, privateAccess, 5, List.of());
    }
}
