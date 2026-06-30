package com.handsome.summary.rag.store;

import java.io.IOException;
import org.apache.lucene.codecs.Codec;
import org.apache.lucene.codecs.FilterCodec;
import org.apache.lucene.codecs.KnnVectorsFormat;
import org.apache.lucene.codecs.KnnVectorsReader;
import org.apache.lucene.codecs.KnnVectorsWriter;
import org.apache.lucene.index.SegmentReadState;
import org.apache.lucene.index.SegmentWriteState;

public class SummaraidGptLuceneCodec extends FilterCodec {

    private static final int MAX_DIMENSIONS = 4096;
    private static final String DEFAULT_CODEC_NAME = "Lucene103";

    public SummaraidGptLuceneCodec() {
        this(Codec.forName(DEFAULT_CODEC_NAME));
    }

    public SummaraidGptLuceneCodec(Codec delegate) {
        super(delegate.getName(), delegate);
    }

    @Override
    public KnnVectorsFormat knnVectorsFormat() {
        var delegateFormat = super.knnVectorsFormat();
        return new KnnVectorsFormat(delegateFormat.getName()) {
            @Override
            public KnnVectorsWriter fieldsWriter(SegmentWriteState state) throws IOException {
                return delegateFormat.fieldsWriter(state);
            }

            @Override
            public KnnVectorsReader fieldsReader(SegmentReadState state) throws IOException {
                return delegateFormat.fieldsReader(state);
            }

            @Override
            public int getMaxDimensions(String fieldName) {
                return MAX_DIMENSIONS;
            }
        };
    }
}
