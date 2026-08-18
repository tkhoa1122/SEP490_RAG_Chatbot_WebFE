"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Edit2, Trash2, PackageSearch } from "lucide-react";
import { ProductDTO } from "@/infrastructure/dto/ProductDTO";
import { productAPI } from "@/infrastructure/api/productAPI";
import { toast } from "react-hot-toast";

interface ProductDataTableProps {
  tenantId: string;
  onEdit: (product: ProductDTO) => void;
  refreshTrigger: number;
}

export function ProductDataTable({ tenantId, onEdit, refreshTrigger }: ProductDataTableProps) {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = { PageIndex: page, PageSize: pageSize };
      if (searchQuery.trim() !== "") {
        // Viết hoa chữ cái đầu để workaround backend case-sensitive search
        const q = searchQuery.trim();
        params.Name = q.charAt(0).toUpperCase() + q.slice(1);
      }
      const res = await productAPI.getProducts(tenantId, params) as any;
      if (res) {
        const responseData = res.data?.items ? res.data : (res.items ? res : res.data);
        setProducts(responseData?.items || responseData?.data || (Array.isArray(responseData) ? responseData : []));
        setTotalPages(responseData?.totalPages || res.totalPages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error("Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchProducts();
    }, searchQuery ? 400 : 0);
    return () => clearTimeout(debounce);
  }, [tenantId, page, searchQuery, refreshTrigger]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;
    
    try {
      await productAPI.deleteProduct(id);
      toast.success("Đã xóa sản phẩm");
      fetchProducts();
    } catch (error) {
      toast.error("Xóa sản phẩm thất bại");
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm kiếm sản phẩm..."
            className="pl-8 bg-background"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1); // Reset page on search
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="font-semibold uppercase tracking-wider text-xs">Mã SP</TableHead>
              <TableHead className="font-semibold uppercase tracking-wider text-xs">Sản phẩm</TableHead>
              <TableHead className="font-semibold uppercase tracking-wider text-xs">Danh mục</TableHead>
              <TableHead className="font-semibold uppercase tracking-wider text-xs">Giá</TableHead>
              <TableHead className="font-semibold uppercase tracking-wider text-xs">Kho</TableHead>
              <TableHead className="font-semibold uppercase tracking-wider text-xs">Trạng thái</TableHead>
              <TableHead className="text-right pr-4 font-semibold uppercase tracking-wider text-xs">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-40 text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary/60" />
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <PackageSearch className="h-10 w-10 mb-3 opacity-20" />
                    <p className="text-sm">Không tìm thấy sản phẩm nào.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              products.map((p: any) => {
                const idStr = String(p.id || p.product_id || p.externalId || "N/A");
                const shortId = idStr.includes("-") ? idStr.split("-")[0] : idStr;
                const name = p.name || p.p_name || "Không tên";
                const imageUrl = (p.images && p.images.length > 0) ? p.images[0] : (p.imageUrl || p.image_url || p.p_image_url);
                const category = p.category || p.categoryName || p.p_category || "Chưa phân loại";
                const price = p.price ?? p.p_price ?? 0;
                const currency = p.currency ?? p.p_currency ?? "VND";
                const stock = p.stockQuantity ?? p.in_stock ?? p.stock ?? 0;
                const isActive = p.status ? p.status === 'Active' : (p.is_active !== false);

                return (
                  <TableRow key={idStr} className="group hover:bg-muted/50">
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {shortId}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        {imageUrl ? (
                          <img src={imageUrl} alt={name} className="h-10 w-10 rounded-md object-cover border" />
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center border">
                            <PackageSearch className="h-5 w-5 text-muted-foreground/50" />
                          </div>
                        )}
                        <div>
                          <p className="line-clamp-1">{name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{category}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat("vi-VN", { style: "currency", currency: currency }).format(price)}
                    </TableCell>
                    <TableCell>{stock}</TableCell>
                    <TableCell>
                      {isActive ? (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                          Đang bán
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-slate-500/10 text-slate-600 border-slate-500/20">
                          Ngừng bán
                        </Badge>
                      )}
                    </TableCell>
                  <TableCell className="text-right pr-4">
                    <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => onEdit(p)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" className="h-8 w-8 p-0" onClick={() => handleDelete(idStr)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      {!loading && products.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Trang {page} / {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Sau
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
