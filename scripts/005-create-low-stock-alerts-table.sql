CREATE TABLE IF NOT EXISTS low_stock_alerts (
  id BIGSERIAL PRIMARY KEY,
  product_stock_code TEXT NOT NULL,
  alert_triggered_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  current_stock_at_alert INTEGER NOT NULL,
  min_stock_level_at_alert INTEGER NOT NULL,
  status TEXT DEFAULT 'active' NOT NULL, -- 'active', 'acknowledged', 'resolved'
  resolved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_product_stock_code
      FOREIGN KEY(product_stock_code)
      REFERENCES products(stock_code)
      ON DELETE CASCADE -- If product is deleted, delete alerts too
);

CREATE INDEX IF NOT EXISTS idx_low_stock_alerts_product_stock_code ON low_stock_alerts(product_stock_code);
CREATE INDEX IF NOT EXISTS idx_low_stock_alerts_status ON low_stock_alerts(status);

COMMENT ON TABLE low_stock_alerts IS 'Stores alerts for products that fall below their minimum stock level.';
COMMENT ON COLUMN low_stock_alerts.status IS 'Status of the alert: active, acknowledged, resolved.';
COMMENT ON COLUMN low_stock_alerts.product_stock_code IS 'References the stock_code in the products table.';
COMMENT ON COLUMN low_stock_alerts.alert_triggered_at IS 'Timestamp when the alert was first triggered.';
COMMENT ON COLUMN low_stock_alerts.current_stock_at_alert IS 'Stock quantity of the product when the alert was triggered.';
COMMENT ON COLUMN low_stock_alerts.min_stock_level_at_alert IS 'The minimum stock level defined for the product when the alert was triggered.';
