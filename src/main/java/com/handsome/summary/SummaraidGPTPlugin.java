package com.handsome.summary;

import static org.apache.commons.lang3.ObjectUtils.defaultIfNull;
import static run.halo.app.extension.index.IndexAttributeFactory.simpleAttribute;

import com.handsome.summary.extension.Summary;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import run.halo.app.extension.Scheme;
import run.halo.app.extension.SchemeManager;
import run.halo.app.extension.index.IndexSpec;
import run.halo.app.plugin.BasePlugin;
import run.halo.app.plugin.PluginContext;

/**
 * <p>Plugin main class to manage the lifecycle of the plugin.</p>
 * <p>This class must be public and have a public constructor.</p>
 * <p>Only one main class extending {@link BasePlugin} is allowed per plugin.</p>
 *
 * @author guqing
 * @since 1.0.0
 */
@Component
@Slf4j
public class SummaraidGPTPlugin extends BasePlugin {
    @Autowired
    private SchemeManager schemeManager;

    public SummaraidGPTPlugin(PluginContext pluginContext) {
        super(pluginContext);
    }
    @Override
    public void start() {
        registerScheme();
    }
    @Override
    public void stop() {
        unregisterScheme();
    }
    private void registerScheme() {
        schemeManager.register(Summary.class, indexSpecs -> {
            indexSpecs.add(new IndexSpec()
                .setName("postMetadataName")
                .setIndexFunc(simpleAttribute(Summary.class,
                    selectedComment -> selectedComment.getSummarySpec().getPostSummary())
                ));
            indexSpecs.add(new IndexSpec()
                .setName("postUrl")
                .setIndexFunc(simpleAttribute(Summary.class,
                    selectedComment -> selectedComment.getSummarySpec().getPostUrl())
                ));
            indexSpecs.add(new IndexSpec()
                .setName("postSummary")
                .setIndexFunc(simpleAttribute(Summary.class,
                    selectedComment -> selectedComment.getSummarySpec().getPostSummary())
                ));
        });
    }

    private void unregisterScheme() {
        Scheme tokenScheme = schemeManager.get(Summary.class);
        schemeManager.unregister(tokenScheme);
    }
}
