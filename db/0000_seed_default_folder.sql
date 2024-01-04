INSERT INTO `folders`(id, name, position)
VALUES ('default', 'Default', 0)
ON CONFLICT(id) DO NOTHING;
