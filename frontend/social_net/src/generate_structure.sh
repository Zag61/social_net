#!/usr/bin/env bash
# generate_structure.sh
# usage: ./generate_structure.sh [ROOT_DIR] [OUTPUT_FILE]
# example: ./generate_structure.sh . structure.md

set -euo pipefail

root="${1:-.}"
out="${2:-structure.md}"

# нормализуем путь (уберём возможный завершающий слеш)
root="${root%/}"

# определяем расширение (для небольшого MD-заголовка)
ext="${out##*.}"
is_md=false
if [ "$ext" = "md" ] || [ "$ext" = "markdown" ]; then
  is_md=true
fi

# создаём/перезаписываем файл
: > "$out"

if $is_md; then
  # заголовок с именем каталога
  echo "# Структура каталога: $(basename "$root")" >> "$out"
  echo "" >> "$out"
fi

# Находим все файлы и папки, сортируем и обрабатываем по одному (null-terminated)
# Используем process substitution, чтобы while выполнялся в том же процессе (портативнее для записи)
while IFS= read -r -d '' p; do
  # получаем относительный путь относительно root
  if [ "$root" = "." ]; then
    rel="${p#./}"
  else
    # если p == root — rel будет пустой строкой
    rel="${p#"$root"/}"
  fi

  # если это сам корень — печатаем его отдельно и продолжаем
  if [ "$p" = "$root" ]; then
    name="$(basename "$root")"
    if [ -z "$name" ]; then name="$root"; fi
    if [ -d "$p" ]; then
      if $is_md; then
        echo "- **$name/**" >> "$out"
      else
        echo "$name/" >> "$out"
      fi
    else
      echo "- $name" >> "$out"
    fi
    continue
  fi

  # глубина = количество '/' в rel
  # если rel пуст — depth 0
  if [ -z "$rel" ]; then
    depth=0
  else
    # count slashes
    slash_count="${rel//[^\/]/}"
    depth=${#slash_count}
  fi

  # создаём отступ: два пробела на уровень
  indent=""
  for ((i=0;i<depth;i++)); do indent+="  "; done

  base="$(basename "$p")"
  if [ -d "$p" ]; then
    if $is_md; then
      echo "${indent}- **$base/**" >> "$out"
    else
      echo "${indent}${base}/" >> "$out"
    fi
  else
    echo "${indent}- $base" >> "$out"
  fi
done < <(find "$root" -print0 | sort -z)
