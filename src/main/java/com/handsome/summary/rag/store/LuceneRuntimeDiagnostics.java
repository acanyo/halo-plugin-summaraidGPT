package com.handsome.summary.rag.store;

import java.io.IOException;
import java.net.URL;
import java.security.CodeSource;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;
import org.apache.lucene.analysis.cjk.CJKAnalyzer;
import org.apache.lucene.codecs.Codec;
import org.apache.lucene.index.IndexWriterConfig;

final class LuceneRuntimeDiagnostics {

    private static final String CODEC_SERVICE = "META-INF/services/org.apache.lucene.codecs.Codec";
    private static final int MAX_SERVICE_URLS = 12;

    private LuceneRuntimeDiagnostics() {
    }

    static String describe() {
        return "luceneCore=" + codeSource(IndexWriterConfig.class)
            + ", luceneClassLoader=" + classLoaderName(IndexWriterConfig.class.getClassLoader())
            + ", analyzer=" + codeSource(CJKAnalyzer.class)
            + ", analyzerClassLoader=" + classLoaderName(CJKAnalyzer.class.getClassLoader())
            + ", codecServices=" + codecServices();
    }

    private static String codecServices() {
        var classLoader = Codec.class.getClassLoader();
        try {
            Enumeration<URL> resources = classLoader == null
                ? ClassLoader.getSystemResources(CODEC_SERVICE)
                : classLoader.getResources(CODEC_SERVICE);
            List<String> urls = new ArrayList<>();
            while (resources.hasMoreElements() && urls.size() < MAX_SERVICE_URLS) {
                urls.add(resources.nextElement().toExternalForm());
            }
            if (resources.hasMoreElements()) {
                urls.add("...");
            }
            return urls.toString();
        } catch (IOException e) {
            return "unavailable:" + e.getClass().getSimpleName() + ":" + e.getMessage();
        }
    }

    private static String codeSource(Class<?> type) {
        CodeSource codeSource = type.getProtectionDomain().getCodeSource();
        if (codeSource == null || codeSource.getLocation() == null) {
            return type.getName() + "@unknown";
        }
        return type.getName() + "@" + codeSource.getLocation().toExternalForm();
    }

    private static String classLoaderName(ClassLoader classLoader) {
        if (classLoader == null) {
            return "bootstrap";
        }
        return classLoader.getClass().getName() + "@"
            + Integer.toHexString(System.identityHashCode(classLoader));
    }
}
